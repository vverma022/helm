//! Daemon-only provider discovery layered over shared protocol models.

use std::path::Path;

pub use helm_protocol::model::*;

pub fn provider_probe(provider: ProviderKind, binary_override: Option<&str>) -> ProviderProbe {
    let path = match binary_override {
        Some(binary) => crate::command_env::resolve_binary_override(binary),
        None => crate::command_env::find_executable(provider.command()),
    };
    ProviderProbe {
        provider,
        installed: path.is_some(),
        authenticated: path
            .as_deref()
            .and_then(|path| probe_authenticated(provider, path)),
        path,
        models: crate::model_catalog::fallback_models(provider),
        agent_presets: crate::model_catalog::fallback_agent_presets(provider),
    }
}

/// Whether an installed CLI is signed in, for the providers that will say.
///
/// `None` is the honest answer for everything else: most CLIs offer no status
/// command, and guessing from a missing config file would flag a working
/// install as broken. Callers must treat `None` as "no claim", never as false.
fn probe_authenticated(provider: ProviderKind, binary: &Path) -> Option<bool> {
    match provider {
        // `cursor-agent about` reports the CLI version and the signed-in
        // account together, so one short-lived process answers what would
        // otherwise take two. `status` reports the same thing, but its
        // spinner announces "Starting login process", which is the wrong
        // thing to run on a background sweep.
        ProviderKind::Cursor => {
            let mut command = crate::command_env::command(binary);
            let command = command.arg("about").stdin(std::process::Stdio::null());
            let output = crate::command_env::output(command).ok()?;
            let combined = format!(
                "{}\n{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
            Some(parse_cursor_authenticated(&combined))
        }
        _ => None,
    }
}

/// Cursor prints an `User Email` row carrying either the account or the
/// literal "Not logged in". Absence of the row means the output shape moved,
/// which is not evidence of being signed out.
fn parse_cursor_authenticated(output: &str) -> bool {
    !output.to_ascii_lowercase().contains("not logged in")
}

/// Detect a provider and hydrate its catalog from the daemon-owned cache.
///
/// This is the fast half of stale-while-revalidate: clients can render the
/// last successful catalog immediately, then request live discovery to replace
/// it. Cache I/O stays in the daemon instead of leaking host filesystem access
/// into desktop or Web clients.
pub fn cached_provider_probe(
    provider: ProviderKind,
    binary_override: Option<&str>,
) -> ProviderProbe {
    let cached = crate::model_catalog::cached_models(provider);
    apply_cached_models(provider_probe(provider, binary_override), cached)
}

fn apply_cached_models(
    mut probe: ProviderProbe,
    cached_models: Option<Vec<ProviderModel>>,
) -> ProviderProbe {
    if probe.provider.supports_model_discovery()
        && let Some(models) = cached_models
    {
        probe.models = models;
    }
    probe
}

pub fn discover_provider_models(mut probe: ProviderProbe) -> ProviderProbe {
    if probe.provider.supports_model_discovery()
        && let Some(path) = probe.path.as_deref()
    {
        let (models, agent_presets) = crate::model_catalog::discover_catalog(probe.provider, path);
        probe.models = models;
        probe.agent_presets = agent_presets;
    }
    probe
}

/// Run `<cli> --version` on the daemon host and extract its first version-like
/// token. Provider CLIs decorate this output differently, so clients receive a
/// normalized value rather than subprocess output.
pub fn probe_provider_version(binary: &Path) -> Option<String> {
    let mut command = crate::command_env::command(binary);
    let command = command.arg("--version").stdin(std::process::Stdio::null());
    let output = crate::command_env::output(command).ok()?;
    let combined = format!(
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    parse_cli_version(&combined)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cached_catalog_replaces_fallback_before_live_discovery() {
        let probe = ProviderProbe {
            provider: ProviderKind::Codex,
            installed: true,
            authenticated: None,
            path: Some("/usr/bin/codex".into()),
            models: crate::model_catalog::fallback_models(ProviderKind::Codex),
            agent_presets: Vec::new(),
        };
        let cached = vec![ProviderModel::new("cached-model", "Cached model").default()];

        let probe = apply_cached_models(probe, Some(cached));

        assert_eq!(probe.models.len(), 1);
        assert_eq!(probe.models[0].id, "cached-model");
    }

    #[test]
    fn cursor_reports_its_signed_out_account() {
        let signed_out = "About Cursor CLI\n\nCLI Version  2026.01.23\nUser Email   Not logged in";
        let signed_in = "About Cursor CLI\n\nCLI Version  2026.01.23\nUser Email   dev@example.com";

        assert!(!parse_cursor_authenticated(signed_out));
        assert!(parse_cursor_authenticated(signed_in));
        // An output shape we do not recognize is not evidence of a problem.
        assert!(parse_cursor_authenticated(""));
    }
}
