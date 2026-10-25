# Remus Design System — Foundations (feature/design-system-foundations)

Source of truth: [Remus Figma](https://www.figma.com/design/J9mlZzajI8meLd5KQYg4KB/Remus?node-id=189-206).

## Inventory verified in Figma

- Collections: `Primitives`, `Color`, `Dimension`, `Typography`, `Motion`.
- Color modes: Athlete Light, Athlete Dark, Admin Light, Admin Dark.
- Typography: SF Pro on iOS and Roboto on Android; semantic styles match across platforms.
- Dimensions: spacing 4/8/16/24/32/48/64; radius 0/4/8/12/16/full; control heights 40/50/56.
- Atoms include Button, Icon Button, Form Controls, Iconography, Weather, Identity, Navigation, Chart Primitives and Capture.
- Molecules include Data Display, Weather, Unified Charts and Capture.

## Increment 001 — Athlete Primary Button

Figma frame: `Button/Primary` (76:14), default `69:2`, small `72:2`, large `72:30`, pressed `72:18`, disabled `72:22`.

- Primary is **outlined** (2-unit contour), NOT solid.
- Radius 12; intrinsic width follows label and horizontal padding 16/24/32 by size.
- Heights 40/50/56, labels 14/16/18 semibold.
- Pressed changes contour and text to semantic `primaryPressed` without layout shift.
- Disabled has semantic `disabled` color and opacity 0.62, no action.
- Small's 40-unit visual height gains 4-unit touch slop above/below to meet the 48-unit touch target in controlled layouts.
- Icon (exact Figma SVG asset) and Loading are deliberately **not in scope** for increment 001; implement after the icon atom, not via an unrelated glyph.
- Debug-only UI catalog uses mock callbacks, with no backend, device or navigation dependencies.

## Known Figma discrepancy (do not silently resolve)

The Motion variables list `quick=150`, `standard=300`, `deliberate=500` ms; the Dimension & Motion documentation page visibly lists 120/240/400 ms. No motion tokens are implemented in increment 001 pending design reconciliation.

## Review gates

1. Jest / TypeScript / ESLint pass.
2. Android and iOS QA Debug open a gallery without native changes.
3. Light/Dark switch updates colors; all sizes keep intrinsic widths.
4. Pressed changes color; Disabled does not invoke callback.
5. Compare screenshots of the 50-unit default button to Figma `69:2`.

Only merge into `develop` after visual QA. Do not touch Production or create releases.
