import { colors, radius, stroke, type DesignColorMode } from '../tokens';

/** Figma 07 Atoms — Icon Button (97:2). All dimensions are dp/pt. */
export const iconButtonSizes = {
  small: 40,
  medium: 50,
  large: 56,
  workout: 72,
} as const;

export type IconButtonSize = keyof typeof iconButtonSizes;
export type IconButtonVariant = 'neutral' | 'primary';

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
    : pressed
      ? palette.primaryPressed
      : palette.primary;
  const color = disabled ? palette.disabled : activeColor;
  const filled = size === 'workout';

  return {
    width: diameter,
    height: diameter,
    borderRadius: radius.full,
    borderWidth: filled ? 0 : stroke.emphasis,
    borderColor: color,
    backgroundColor: filled ? color : 'transparent',
    // On filled neutral workout controls use the high-contrast on-accent token.
    iconColor: filled
      ? variant === 'neutral'
        ? palette.onAccent
        : disabled
          ? palette.primary
          : palette.background
      : color,
    iconSize: 32,
    opacity: disabled ? 0.42 : pressed ? 0.86 : 1,
  };
}

export function createIconButtonInteraction({
  accessibilityLabel,
  disabled = false,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel,
    accessibilityState: { disabled },
    disabled,
    onPress: disabled ? undefined : onPress,
  };
}
