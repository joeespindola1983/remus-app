# Selection Controls — Incremento 008

Source of truth: Figma **10 Atoms — Form Controls** (`198:206`).

Four interactive native selection atoms use semantic Remus theme tokens and `react-native-svg` (already installed):

- `RemusCheckbox` (`304:6788`): 44 px target / 24 px square. Unchecked, checked, indeterminate/mixed, disabled. Controlled `checked` + `onValueChange`. Mixed transitions to checked.
- `RemusRadio` (`304:6796`): 44 px target / 11 px ring / 6 px dot. Selected/unselected/disabled. Parent owns mutually exclusive selection; `onSelect` is invoked for a selected option.
- `RemusToggle` (`298:6259`): 52 × 44 px target, track spanning x=2.5..49.5, thumb center x=16/36, y=22, r=11. Controlled `value` + `onValueChange`.
- `RemusFilterChip` (`297:5388`): 44 px tall, min 96 px wide, fully rounded 22 px, 13 px semibold system font. Default 1 px border, selected 2 px primary border. Controlled `selected` + `onValueChange`.

Each uses 44 px or larger touch target, exposes a meaningful accessible label and native checked/selected/disabled state, and suppresses actions while disabled. Mark/check shape and position come from Figma, not emojis or platform-specific widgets.

Checkbox, radio and toggle are isolated atoms: labels and mutually-exclusive radio group semantics belong to later molecule compositions. The gallery exercises real state transitions in Athlete Light and Dark.

## QA

Run `npm run verify`, then inspect both native platforms in both athlete modes. Test checkbox unchecked ↔ checked, mixed → checked, radio A/B exclusivity, switch on/off, chip selection, disabled no-op. Inspect small displays for line wrapping and touch spacing before commit.
