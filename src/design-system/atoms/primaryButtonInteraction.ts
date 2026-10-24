/**
 * Pressable props controlled by Remus, independently of React Native's
 * internal component tree. The same object is passed to the native Pressable.
 */
export type PrimaryButtonInteraction = {
  accessibilityRole: 'button';
  accessibilityLabel: string;
  accessibilityState: { disabled: boolean };
  disabled: boolean;
  onPress?: () => void;
};

export function createPrimaryButtonInteraction({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress?: () => void;
}): PrimaryButtonInteraction {
  return {
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityState: { disabled },
    disabled,
    onPress: disabled ? undefined : onPress,
  };
}
