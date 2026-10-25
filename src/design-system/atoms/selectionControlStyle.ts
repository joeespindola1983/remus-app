import { colors, radius, type DesignColorMode } from '../tokens';

/** Geometry from Figma 10 Atoms — Form Controls (198:206), in dp/pt. */
export const selectionControlGeometry = {
  touchSize: 44,
  checkboxSize: 24,
  checkboxRadius: radius.sm,
  radioRadius: 11,
  radioDotRadius: 6,
  toggleWidth: 52,
  toggleTrackHeight: 28,
  toggleThumbRadius: 11,
  chipMinWidth: 96,
  chipRadius: 22,
  chipFontSize: 13,
} as const;

export type CheckboxValue = boolean | 'mixed';

type ControlOptions = { mode?: DesignColorMode; disabled?: boolean };

export function getCheckboxAppearance({
  mode = 'athleteLight', checked = false, indeterminate = false, disabled = false,
}: ControlOptions & { checked?: boolean; indeterminate?: boolean } = {}) {
  const palette = colors[mode];
  const selected = checked || indeterminate;
  return {
    size: selectionControlGeometry.touchSize,
    borderColor: disabled && !selected ? palette.disabled : selected ? palette.primary : palette.border,
    backgroundColor: selected ? palette.primary : palette.surface,
    markColor: palette.onPrimary,
    opacity: disabled ? 0.5 : 1,
    checkedState: indeterminate ? 'mixed' as const : checked,
  };
}

export function getRadioAppearance({
  mode = 'athleteLight', selected = false, disabled = false,
}: ControlOptions & { selected?: boolean } = {}) {
  const palette = colors[mode];
  return {
    size: selectionControlGeometry.touchSize,
    borderColor: disabled && !selected ? palette.disabled : selected ? palette.primary : palette.border,
    backgroundColor: palette.surface,
    dotColor: palette.primary,
    opacity: disabled ? 0.5 : 1,
  };
}

export function getToggleAppearance({
  mode = 'athleteLight', value = false, disabled = false,
}: ControlOptions & { value?: boolean } = {}) {
  const palette = colors[mode];
  return {
    width: selectionControlGeometry.toggleWidth,
    height: selectionControlGeometry.touchSize,
    trackColor: value ? palette.primary : palette.disabled,
    thumbColor: '#FFFFFF', // Exact constant white thumb on both Figma variants.
    thumbCenterX: value ? 36 : 16,
    opacity: disabled ? 0.5 : 1,
  };
}

export function getFilterChipAppearance({
  mode = 'athleteLight', selected = false, disabled = false,
}: ControlOptions & { selected?: boolean } = {}) {
  const palette = colors[mode];
  return {
    height: selectionControlGeometry.touchSize,
    minWidth: selectionControlGeometry.chipMinWidth,
    borderRadius: selectionControlGeometry.chipRadius,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? palette.primary : palette.border,
    backgroundColor: palette.surface,
    textColor: palette.text,
    fontSize: selectionControlGeometry.chipFontSize,
    fontWeight: '600' as const,
    opacity: disabled ? 0.5 : 1,
  };
}

/** Pure, shared interaction contract. Checkbox mixed transitions to checked. */
export function createSelectionInteraction({
  kind, label, selected = false, disabled = false, indeterminate = false, onValueChange,
}: {
  kind: 'checkbox' | 'radio' | 'switch' | 'chip';
  label: string;
  selected?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  return {
    accessibilityRole: (kind === 'chip' ? 'button' : kind) as 'button' | 'checkbox' | 'radio' | 'switch',
    accessibilityLabel: label,
    accessibilityState: kind === 'chip'
      ? { selected, disabled }
      : { checked: indeterminate && kind === 'checkbox' ? 'mixed' as const : selected, disabled },
    disabled,
    onPress: disabled ? undefined : () => onValueChange?.(kind === 'radio' || indeterminate ? true : !selected),
  };
}
