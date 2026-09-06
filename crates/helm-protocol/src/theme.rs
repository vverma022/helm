//! Process-neutral theme and accent preferences persisted in the desktop
//! settings file.

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ThemePreference {
    #[default]
    System,
    Light,
    Dark,
}

impl ThemePreference {
    pub const ALL: [Self; 3] = [Self::System, Self::Light, Self::Dark];

    pub fn label(self) -> String {
        match self {
            Self::System => crate::i18n::translate("settings.theme_system"),
            Self::Light => crate::i18n::translate("settings.theme_light"),
            Self::Dark => crate::i18n::translate("settings.theme_dark"),
        }
    }
}

/// Which hue the interface highlights with. Deliberately narrow: the accent
/// is decoration -- caret, logo, live-activity pulses -- and never carries
/// state, so widening it cannot break meaning.
#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum AccentPreference {
    #[default]
    Red,
    Orange,
    Green,
    Blue,
    Purple,
    Graphite,
}

impl AccentPreference {
    pub const ALL: [Self; 6] = [
        Self::Red,
        Self::Orange,
        Self::Green,
        Self::Blue,
        Self::Purple,
        Self::Graphite,
    ];

    pub fn label(self) -> String {
        match self {
            Self::Red => crate::i18n::translate("settings.accent_red"),
            Self::Orange => crate::i18n::translate("settings.accent_orange"),
            Self::Green => crate::i18n::translate("settings.accent_green"),
            Self::Blue => crate::i18n::translate("settings.accent_blue"),
            Self::Purple => crate::i18n::translate("settings.accent_purple"),
            Self::Graphite => crate::i18n::translate("settings.accent_graphite"),
        }
    }

    /// `0xRRGGBB` for dark and light grounds. Split because a hue that reads
    /// on near-black washes out on paper, and vice versa.
    pub fn rgb(self, dark: bool) -> u32 {
        match (self, dark) {
            (Self::Red, true) => 0xE5484D,
            (Self::Red, false) => 0xD1373C,
            (Self::Orange, true) => 0xF17B3D,
            (Self::Orange, false) => 0xC5541A,
            (Self::Green, true) => 0x3DA96B,
            (Self::Green, false) => 0x1B7A4B,
            (Self::Blue, true) => 0x4C97F0,
            (Self::Blue, false) => 0x1667C7,
            (Self::Purple, true) => 0x9A6BD0,
            (Self::Purple, false) => 0x7247AE,
            (Self::Graphite, true) => 0x9B9B9F,
            (Self::Graphite, false) => 0x6B6B70,
        }
    }
}
