//! Daemon-owned pseudoterminals for remote clients.
//!
//! The daemon owns the shell, cwd, and PTY. Clients only render the byte
//! stream and send input/resize controls, so a browser can operate against a
//! daemon on another machine without interpreting any daemon-side paths.

#[cfg(not(unix))]
use std::path::Path;

#[cfg(not(unix))]
use anyhow::bail;

#[cfg(not(unix))]
use crate::EventSink;

#[cfg(unix)]
mod platform {
    use std::io::{Read as _, Write as _};
    use std::sync::Arc;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::thread::JoinHandle;
    use std::time::Duration;

    use alacritty_terminal::event::{OnResize as _, WindowSize};
    use alacritty_terminal::tty::{self, EventedPty as _, EventedReadWrite as _, Shell};
    use anyhow::{Context as _, bail};
    use base64::Engine as _;
    use parking_lot::Mutex;
    use serde_json::json;

    use crate::{EventSink, WireDriverEvent};

    const CELL_WIDTH: u16 = 8;
    const CELL_HEIGHT: u16 = 16;
    const MIN_COLUMNS: u16 = 2;
    const MIN_ROWS: u16 = 1;

    /// How long a shell gets to honour `SIGHUP` before the terminal stops
    /// asking. A shell that exits cleanly flushes its output first, which is
    /// worth a short wait; one that has not gone by now is not going to.
    const HANGUP_GRACE: Duration = Duration::from_millis(500);
    /// How long the reader gets once the child has been killed outright.
    /// `SIGKILL` cannot be caught, so the master read is guaranteed to fail
    /// and the thread to fall out of its loop; this only covers scheduling.
    const KILL_GRACE: Duration = Duration::from_secs(2);

    pub struct DaemonTerminal {
        pty: Arc<Mutex<tty::Pty>>,
        stopped: Arc<AtomicBool>,
        /// Raised by the reader as it leaves its loop. `stopped` is a request;
        /// this is the acknowledgement, and it is what makes shutdown
        /// bounded — the flag can be waited on with a deadline, where a
        /// `JoinHandle` can only be waited on forever.
        finished: Arc<AtomicBool>,
        reader: Option<JoinHandle<()>>,
    }

    /// Wait for `flag` for at most `timeout`, reporting whether it was raised.
    /// Polled rather than parked: the setter is a bare `AtomicBool` on a
    /// thread that may be blocked in a syscall, so there is nothing to be
    /// notified by.
    fn wait_for_flag(flag: &AtomicBool, timeout: Duration) -> bool {
        let deadline = std::time::Instant::now() + timeout;
        loop {
            if flag.load(Ordering::Acquire) {
                return true;
            }
            if std::time::Instant::now() >= deadline {
                return false;
            }
            std::thread::sleep(Duration::from_millis(2));
        }
    }

    impl DaemonTerminal {
        pub fn open(
            cwd: &std::path::Path,
            cols: u16,
            rows: u16,
            events: EventSink,
        ) -> anyhow::Result<Self> {
            if !cwd.is_dir() {
                bail!(
                    "terminal working directory does not exist: {}",
                    cwd.display()
                );
            }

            let shell = crate::command_env::default_terminal_shell();
            let shell_args = crate::command_env::default_terminal_shell_args(&shell);
            let mut options = tty::Options {
                shell: Some(Shell::new(shell.to_string_lossy().into_owned(), shell_args)),
                working_directory: Some(cwd.to_owned()),
                drain_on_exit: false,
                ..Default::default()
            };
            for (name, value) in crate::command_env::shell_environment() {
                options.env.insert(
                    name.to_string_lossy().into_owned(),
                    value.to_string_lossy().into_owned(),
                );
            }
            options.env.insert("TERM".into(), "xterm-256color".into());
            options.env.insert("COLORTERM".into(), "truecolor".into());

            let size = window_size(cols, rows);
            let pty = tty::new(&options, size, 0)
                .with_context(|| format!("spawn terminal in {}", cwd.display()))?;
            let mut output = pty.file().try_clone().context("clone terminal output")?;
            let pty = Arc::new(Mutex::new(pty));
            let stopped = Arc::new(AtomicBool::new(false));
            let reader_pty = pty.clone();
            let reader_stopped = stopped.clone();
            let finished = Arc::new(AtomicBool::new(false));
            let reader_finished = finished.clone();
            let reader = std::thread::Builder::new()
                .name("helm-daemon-terminal-output".into())
                .spawn(move || {
                    let mut buffer = [0_u8; 32 * 1024];
                    while !reader_stopped.load(Ordering::Acquire) {
                        match output.read(&mut buffer) {
                            Ok(0) => {
                                let _ = events.send_ephemeral(WireDriverEvent::new(
                                    "terminalExited",
                                    serde_json::Value::Null,
                                ));
                                break;
                            }
                            Ok(read) => {
                                let data = base64::engine::general_purpose::STANDARD
                                    .encode(&buffer[..read]);
                                let _ = events.send_ephemeral(WireDriverEvent::new(
                                    "terminalOutput",
                                    json!({ "data": data }),
                                ));
                            }
                            Err(error)
                                if matches!(
                                    error.kind(),
                                    std::io::ErrorKind::WouldBlock
                                        | std::io::ErrorKind::TimedOut
                                        | std::io::ErrorKind::Interrupted
                                ) =>
                            {
                                std::thread::sleep(Duration::from_millis(4));
                            }
                            Err(error) if error.raw_os_error() == Some(libc::EIO) => {
                                // A PTY master may report EIO briefly before the
                                // freshly spawned child has attached its slave.
                                // Only treat it as EOF after Alacritty's SIGCHLD
                                // channel confirms the child actually exited.
                                if reader_pty.lock().next_child_event().is_some() {
                                    let _ = events.send_ephemeral(WireDriverEvent::new(
                                        "terminalExited",
                                        serde_json::Value::Null,
                                    ));
                                    break;
                                }
                                std::thread::sleep(Duration::from_millis(4));
                            }
                            Err(error) => {
                                let _ = events.send_ephemeral(WireDriverEvent::new(
                                    "terminalError",
                                    serde_json::Value::String(error.to_string()),
                                ));
                                break;
                            }
                        }
                    }
                    // Every `break` above lands here, so the acknowledgement
                    // covers each way the loop can end.
                    reader_finished.store(true, Ordering::Release);
                })
                .context("start terminal output thread")?;

            Ok(Self {
                pty,
                stopped,
                finished,
                reader: Some(reader),
            })
        }

        pub fn write(&self, data: Vec<u8>) -> anyhow::Result<()> {
            if data.is_empty() {
                return Ok(());
            }
            let mut pty = self.pty.lock();
            pty.writer()
                .write_all(&data)
                .context("write terminal input")?;
            pty.writer().flush().context("flush terminal input")
        }

        pub fn resize(&self, cols: u16, rows: u16) {
            self.pty.lock().on_resize(window_size(cols, rows));
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn waiting_reports_a_flag_raised_before_the_deadline() {
            let flag = Arc::new(AtomicBool::new(false));
            let setter = flag.clone();
            std::thread::spawn(move || {
                std::thread::sleep(Duration::from_millis(20));
                setter.store(true, Ordering::Release);
            });

            assert!(wait_for_flag(&flag, Duration::from_secs(5)));
        }

        #[test]
        fn waiting_gives_up_rather_than_blocking_forever() {
            // The flag stands for a reader wedged in a read the child never
            // ends. Before this returned, `Drop` joined it unconditionally and
            // took the daemon's request thread down with it.
            let flag = AtomicBool::new(false);
            let started = std::time::Instant::now();

            assert!(!wait_for_flag(&flag, Duration::from_millis(50)));
            assert!(started.elapsed() >= Duration::from_millis(50));
            assert!(
                started.elapsed() < Duration::from_secs(5),
                "the wait must be bounded by its own deadline, not the flag"
            );
        }

        #[test]
        fn an_already_raised_flag_costs_no_wait() {
            let flag = AtomicBool::new(true);
            let started = std::time::Instant::now();

            assert!(wait_for_flag(&flag, Duration::from_secs(30)));
            assert!(started.elapsed() < Duration::from_secs(1));
        }
    }

    impl Drop for DaemonTerminal {
        fn drop(&mut self) {
            self.stopped.store(true, Ordering::Release);
            // The output reader is blocked in a `read` with no timeout, so it
            // only re-checks `stopped` once that read returns — which happens
            // when the child dies and the master reports EOF or EIO. Alacritty
            // hangs the child up when its PTY is dropped, but the reader owns
            // another `Arc` to that PTY, so waiting for the reader first would
            // keep both the child and its slave fd alive. The child has to go
            // first.
            let child_pid = self.pty.lock().child().id() as libc::pid_t;
            let Some(reader) = self.reader.take() else {
                return;
            };

            // SIGHUP asks; a shell that honours it exits having flushed.
            unsafe {
                libc::kill(child_pid, libc::SIGHUP);
            }
            if wait_for_flag(&self.finished, HANGUP_GRACE) {
                let _ = reader.join();
                return;
            }

            // A shell can ignore SIGHUP — zsh under job control on a loaded
            // machine is enough — and then the read never returns and the
            // reader never looks at `stopped` again. This runs on the thread
            // serving CloseTerminal, so joining unconditionally hung the whole
            // daemon on that request until the client gave up two minutes
            // later. SIGKILL cannot be ignored, so the read is guaranteed to
            // fail and the loop to end.
            unsafe {
                libc::kill(child_pid, libc::SIGKILL);
            }
            if wait_for_flag(&self.finished, KILL_GRACE) {
                let _ = reader.join();
                return;
            }

            // Nothing should reach here: the child is dead and its master is
            // readable. Leaking one parked thread is still better than never
            // answering the request that asked for this close, so the handle
            // is dropped rather than joined.
            drop(reader);
        }
    }

    fn window_size(cols: u16, rows: u16) -> WindowSize {
        WindowSize {
            num_lines: rows.max(MIN_ROWS),
            num_cols: cols.max(MIN_COLUMNS),
            cell_width: CELL_WIDTH,
            cell_height: CELL_HEIGHT,
        }
    }
}

#[cfg(unix)]
pub use platform::DaemonTerminal;

#[cfg(not(unix))]
pub struct DaemonTerminal;

#[cfg(not(unix))]
impl DaemonTerminal {
    pub fn open(_cwd: &Path, _cols: u16, _rows: u16, _events: EventSink) -> anyhow::Result<Self> {
        bail!("daemon terminals are not supported on this platform")
    }

    pub fn write(&self, _data: Vec<u8>) -> anyhow::Result<()> {
        bail!("daemon terminals are not supported on this platform")
    }

    pub fn resize(&self, _cols: u16, _rows: u16) {}
}
