# Remus Iconography — Increment 003

Source of truth: Figma [05 Atoms — Iconography](https://www.figma.com/design/J9mlZzajI8meLd5KQYg4KB/Remus?node-id=46-2).

## First implementation

`RemusIcon` is a presentation-only atom backed by `react-native-svg`.

- The eight paths below are copied from **SVG exports of their Figma source components**, not from a third-party icon pack.
- Source artboard: `32×32`; each SVG has one path, with rounded stroke caps/joins and the original stroke width.
- All colors come from semantic design tokens (`primary`, `secondary`, `inverse`) and selected color mode.
- Decorative instances omit `accessibilityLabel`. Informative instances provide an accessible label.
- Icons do not own touch handling. Interactive controls composed around icons must provide their own accessible label and minimum 44-point touch target, according to Figma.
- No runtime SVG URLs, fonts, generated assets, or additional dependencies beyond `react-native-svg@15.16.0`.

| Name | Figma source component ID |
|---|---|
| `home` | `257:206` |
| `chevronRight` | `176:330` |
| `close` | `176:334` |
| `plus` | `176:342` |
| `check` | `176:338` |
| `start` | `176:405` |
| `pause` | `176:409` |
| `stop` | `176:417` |

The source library contains 62 distinct icon names; this increment intentionally implements only eight. The remaining icons are tracked for future increments. Icons and control button behavior are separately tested and visually reviewed on iOS and Android.
