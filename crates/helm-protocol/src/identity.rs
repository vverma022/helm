//! Shared application identity used by the daemon and desktop client.

#[cfg(debug_assertions)]
pub const APP_NAME: &str = "Helm Debug";
#[cfg(not(debug_assertions))]
pub const APP_NAME: &str = "Helm";

#[cfg(debug_assertions)]
pub const APP_ID: &str = "io.github.vverma022.helm.dev";
#[cfg(not(debug_assertions))]
pub const APP_ID: &str = "io.github.vverma022.helm";

#[cfg(debug_assertions)]
pub const DATA_DIRECTORY_NAME: &str = "Helm Debug";
#[cfg(not(debug_assertions))]
pub const DATA_DIRECTORY_NAME: &str = "Helm";
