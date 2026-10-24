import { colors, radius, stroke, type DesignColorMode } from '../tokens';

/** Figma 07 Atoms — Icon Button (97:2). All dimensions are dp/pt. */
export const iconButtonSizes = {
  small: 40,
  medium: 50,
  large: 56,
  workout: 72,
} as const;

export type IconButtonSize = keyof typeof iconButtonSizes;
export type IconButtonVariant = 'neutral' | 'primary' | 'warning' | 'destructive';

export function getIconButtonAppearance({
  size = 'medium',
  variant = 'primary',
  mode = 'athleteLight',
  pressed = false,
  disabled = false,
}: {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  mode?: DesignColorMode;
  pressed?: boolean;
  disabled?: boolean;
}) {
  const palette = colors[mode];
  const diameter = iconButtonSizes[size];
  const activeColor = variant === 'neutral'
    ? palette.accent
    : variant === 'primary'
      ? pressed ? palette.primaryPressed : palette.primary
      : variant === 'warning'
        ? pressed ? palette.warningPressed : palette.warning
        : pressed ? palette.destructivePressed : palette.destructive;
  const color = disabled ? palette.disabled : activeColor;
  const filled = size === 'workout';
  const onFilled = variant === 'neutral'
    ? palette.onAccent
    : variant === 'primary'
      ? palette.background
      : variant === 'warning'
        ? pressed && !disabled ? palette.onWarningPressed : palette.onWarning
        : palette.onDestructive;

  return {
    width: diameter,
    height: diameter,
    borderRadius: radius.full,
    borderWidth: filled ? 0 : stroke.emphasis,
    borderColor: color,
    backgroundColor: filled ? color : 'transparent',
    // Filled Workout controls use their semantic on-color for contrast.
    iconColor: filled ? onFilled : color,
    iconSize: 32,
    opacity: disabled ? 0.42 : pressed ? 0.86 : 1,
  };
}

export function createIconButtonInteraction({
  accessibilityLabel,
  disabled = false,
  loading = false,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}) {
  const unavailable = disabled || loading;
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel,
    accessibilityState: loading ? { disabled: true, busy: true } : { disabled },
    disabled: unavailable,
    onPress: unavailable ? undefined : onPress,
  };
}
