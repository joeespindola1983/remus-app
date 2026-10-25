# Remus Design System — Presentation atoms 009

Figma: Weather `251:206`, Identity `287:3681`, Navigation `321:2`.

- `RemusConditionStatus`: five static labels (Best, Good, Caution, Not Recommended, Uncertain) with a semantic 10px indicator, matching semantic border, and theme background.
- `RemusAvatar`: placeholder displaying initials with 48px (Medium) or 64px (Large) size, 2px primary outline, 18/24px bold text. Profile images will be handled in a later increment.
- `RemusNavigationItem`: 88×64px pressable navigation atom with a native Remus icon, selected underline (28×3px), disabled state and native accessibility state. Real routing is owned by the navigation organism.

All three atoms accept the Design System color mode; the gallery shows Athlete Light/Dark.
No backend, weather forecast, GPS data or navigation routing is introduced by this increment.
Run `npm run verify` before committing and validate both themes on iOS and Android.
