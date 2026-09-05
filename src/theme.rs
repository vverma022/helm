use gpui::{App, Global, Hsla, Rems, Window, WindowAppearance, hsla, rems, rgb, transparent_black};

pub use helm_client::theme::{AccentPreference, ThemePreference};

/// Scaled pixels: a dimension authored at the default 14px UI font size,
/// expressed in rems so the UI font size setting scales it. The window's rem
/// size *is* the UI font size, so at the default setting this resolves to
/// exactly the authored pixel value.
///
/// Chrome text sizes and their line heights go through here. Content surfaces
/// that already derive from a font-size setting — markdown metrics, the file
/// editor, diff rows, tool-output mono — stay in `px` so they never scale
/// twice.
pub fn sp(value: f32) -> Rems {
    rems(value / helm_client::persistence::DEFAULT_UI_FONT_SIZE)
}

fn resolves_to_dark(preference: ThemePreference, system_appearance: WindowAppearance) -> bool {
    match preference {
        ThemePreference::System => matches!(
            system_appearance,
            WindowAppearance::Dark | WindowAppearance::VibrantDark
        ),
        ThemePreference::Light => false,
        ThemePreference::Dark => true,
    }
}

fn native_override(preference: ThemePreference) -> Option<bool> {
    match preference {
        ThemePreference::System => None,
        ThemePreference::Light => Some(false),
        ThemePreference::Dark => Some(true),
    }
}

/// Helm's visual language, take two: neutral graphite surfaces in the spirit
/// of Cursor — color is reserved for meaning. On macOS the sidebar's semantic
/// tint is installed as a native layer above Sidebar vibrancy; keeping this
/// GPUI surface clear avoids incorrectly accumulating the alpha of nested Metal
/// backgrounds. Selected, hovered, and pressed rows remain a 6% neutral layer.
#[derive(Clone, Copy)]
pub struct Theme {
    pub is_dark: bool,
    pub canvas: Hsla,
    pub sidebar: Hsla,
    pub sidebar_drag_background: Hsla,
    pub sidebar_item_background: Hsla,
    pub surface: Hsla,
    pub raised: Hsla,
    pub composer: Hsla,
    pub inset: Hsla,
    /// Terminal screen surface: paper-white in light mode, near-black in dark.
    pub terminal: Hsla,
    pub overlay: Hsla,
    pub overlay_strong: Hsla,

    pub border: Hsla,
    pub border_strong: Hsla,
    pub sidebar_border: Hsla,

    pub text: Hsla,
    pub text_secondary: Hsla,
    pub text_tertiary: Hsla,
    pub text_ghost: Hsla,

    /// Brand coral. Logo, caret, live-activity pulses — nothing structural.
    pub accent: Hsla,
    pub resize_handle: Hsla,
    /// Meter fills in the usage panel. Quota-meter blue by convention;
    /// warning/danger take over as a lane fills.
    pub gauge: Hsla,

    /// Text-selection wash. Painted *under* the glyphs, so it stays
    /// translucent and deliberately reads as the familiar browser blue rather
    /// than as brand color.
    pub selection: Hsla,
    /// Inline `code` foreground and its rounded wash.
    pub code_text: Hsla,
    pub code_wash: Hsla,

    /// Light fill for primary buttons (send, allow), dark glyph on top.
    pub inverse: Hsla,
    pub on_inverse: Hsla,

    pub warning: Hsla,
    pub success: Hsla,
    pub favorite: Hsla,
    pub danger: Hsla,
    pub danger_soft: Hsla,
}

impl Theme {
    /// Override the decorative accent. Split from [`Self::dark`] and
    /// [`Self::light`] so the palettes stay constructible without a
    /// preference, which is what the markdown tests rely on.
    pub fn with_accent(mut self, accent: AccentPreference) -> Self {
        self.accent = rgb(accent.rgb(self.is_dark)).into();
        self
    }

    pub fn current(cx: &App) -> Self {
        if cx.has_global::<ActiveHelmTheme>() {
            cx.global::<ActiveHelmTheme>().0
        } else {
            Self::dark()
        }
    }

    pub fn dark() -> Self {
        Self {
            is_dark: true,
            canvas: if cfg!(target_os = "macos") {
                hsla(0.0, 0.0, 0.055, 0.72)
            } else {
                rgb(0x0F0F10).into()
            },
            sidebar: if cfg!(target_os = "macos") {
                transparent_black()
            } else {
                rgb(0x181818).into()
            },
            sidebar_drag_background: rgb(0x0D0D0E).into(),
            sidebar_item_background: hsla(0.0, 0.0, 0.95, 0.07),
            surface: rgb(0x121213).into(),
            raised: rgb(0x1B1B1D).into(),
            composer: rgb(0x151517).into(),
            inset: rgb(0x0A0A0B).into(),
            terminal: rgb(0x0A0A0B).into(),
            overlay: hsla(0.0, 0.0, 0.95, 0.05),
            overlay_strong: hsla(0.0, 0.0, 0.95, 0.09),

            border: hsla(0.0, 0.0, 0.95, 0.06),
            border_strong: hsla(0.0, 0.0, 0.95, 0.12),
            sidebar_border: hsla(0.0, 0.0, 0.95, 0.07),

            text: rgb(0xEDEDED).into(),
            text_secondary: rgb(0x9E9EA2).into(),
            text_tertiary: rgb(0x727276).into(),
            text_ghost: rgb(0x505055).into(),

            accent: rgb(AccentPreference::Red.rgb(true)).into(),
            resize_handle: rgb(0x3B82F6).into(),
            gauge: rgb(0x3B82F6).into(),

            selection: hsla(211.0 / 360.0, 1.0, 0.50, 0.55),
            code_text: rgb(0xE0A882).into(),
            code_wash: hsla(0.0, 0.0, 0.95, 0.07),

            inverse: rgb(0xE7E9EC).into(),
            on_inverse: rgb(0x17181C).into(),

            warning: rgb(0xE0B36A).into(),
            success: rgb(0x62C987).into(),
            favorite: rgb(0xEAB308).into(),
            danger: rgb(0xE2726A).into(),
            danger_soft: hsla(4.0 / 360.0, 0.55, 0.63, 0.10),
        }
    }

    pub fn light() -> Self {
        Self {
            is_dark: false,
            canvas: if cfg!(target_os = "macos") {
                hsla(0.0, 0.0, 0.99, 0.70)
            } else {
                rgb(0xFAFAFA).into()
            },
            sidebar: if cfg!(target_os = "macos") {
                transparent_black()
            } else {
                rgb(0xF3F3F3).into()
            },
            sidebar_drag_background: rgb(0xF4F4F5).into(),
            sidebar_item_background: hsla(0.0, 0.0, 0.08, 0.07),
            surface: rgb(0xFAFAFA).into(),
            raised: rgb(0xF1F1F2).into(),
            composer: rgb(0xFFFFFF).into(),
            inset: rgb(0xEDEDEE).into(),
            terminal: rgb(0xFFFFFF).into(),
            overlay: hsla(0.0, 0.0, 0.08, 0.05),
            overlay_strong: hsla(0.0, 0.0, 0.08, 0.09),

            border: hsla(0.0, 0.0, 0.08, 0.07),
            border_strong: hsla(0.0, 0.0, 0.08, 0.13),
            sidebar_border: hsla(0.0, 0.0, 0.08, 0.10),

            text: rgb(0x1C1C1E).into(),
            text_secondary: rgb(0x5F5F63).into(),
            text_tertiary: rgb(0x8A8A8E).into(),
            text_ghost: rgb(0xADADB2).into(),

            accent: rgb(AccentPreference::Red.rgb(false)).into(),
            resize_handle: rgb(0x2563EB).into(),
            gauge: rgb(0x2563EB).into(),

            selection: hsla(211.0 / 360.0, 1.0, 0.50, 0.35),
            code_text: rgb(0x9A5528).into(),
            code_wash: hsla(0.0, 0.0, 0.08, 0.06),

            inverse: rgb(0x202227).into(),
            on_inverse: rgb(0xF8F8F9).into(),

            warning: rgb(0xA66B20).into(),
            success: rgb(0x2F8F52).into(),
            favorite: rgb(0xCA8A04).into(),
            danger: rgb(0xC64A42).into(),
            danger_soft: hsla(4.0 / 360.0, 0.55, 0.52, 0.10),
        }
    }
}

#[derive(Clone, Copy)]
struct ActiveHelmTheme(Theme);

impl Global for ActiveHelmTheme {}

/// Publish the resolved palette. [`Theme::current`] reads it back from the
/// global, which is how every view gets its colors.
fn set_active_theme(theme: Theme, cx: &mut App) {
    cx.set_global(ActiveHelmTheme(theme));
}

/// Resolve and publish the startup palette, before any window exists.
pub fn init(cx: &mut App) {
    let system_appearance = cx.window_appearance();
    let theme = if resolves_to_dark(ThemePreference::System, system_appearance) {
        Theme::dark()
    } else {
        Theme::light()
    }
    .with_accent(AccentPreference::default());
    set_active_theme(theme, cx);
}

pub fn apply_theme_preference(
    preference: ThemePreference,
    accent: AccentPreference,
    window: &mut Window,
    cx: &mut App,
) {
    crate::platform::set_window_appearance(window, native_override(preference));
    let is_dark = resolves_to_dark(preference, cx.window_appearance());
    set_active_theme(
        if is_dark {
            Theme::dark()
        } else {
            Theme::light()
        }
        .with_accent(accent),
        cx,
    );
    crate::platform::configure_sidebar_material(window, is_dark);
    window.refresh();
}
