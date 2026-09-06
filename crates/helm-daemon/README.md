# helm-daemon

`helm-daemon` is the standalone process that hosts Helm's provider sessions.
It defaults to a loopback-only listener, authenticates clients with
`HELM_DAEMON_TOKEN`, and
prints one JSON readiness record to stdout containing its address, protocol
version, and process ID.

```text
HELM_DAEMON_TOKEN=<secret> helm-daemon --bind 127.0.0.1:0 [--parent-pid PID] [--allow-origin ORIGIN]...
```

Helm Desktop supervises this process. Debug builds use the feature-gated
`helm-debug-daemon` target at `target/debug/helm-debug-daemon`, so rebuilding
provider code replaces only the daemon. Release distributions place the signed
`helm-daemon` binary beside the desktop executable.

The token is a full-control capability for a trusted Helm client, not a user or
workspace-scoped credential. Browser handshakes are rejected unless their exact
Origin was supplied with `--allow-origin`; native clients send no Origin. A
non-loopback bind is refused unless `--allow-non-loopback` is also present.
Helm Desktop adds that flag only after the user enables exposure in Settings →
Daemon. The daemon does not terminate TLS itself. For access outside a private
network, put a trusted TLS proxy or tunnel in front of it and use `wss://`. Do
not give the daemon token to untrusted page JavaScript.
