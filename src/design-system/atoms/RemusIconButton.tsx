import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { RemusIcon } from './RemusIcon';
import { type RemusIconName } from './remusIconDefinition';
import {
  createIconButtonInteraction,
  getIconButtonAppearance,
  type IconButtonSize,
  type IconButtonVariant,
} from './iconButtonStyle';

export type RemusIconButtonProps = {
  icon: RemusIconName;
  /** Required: icon-only buttons must have an accessible action name. */
  accessibilityLabel: string;
  onPress?: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  mode?: DesignColorMode;
  disabled?: boolean;
  testID?: string;
};

/**
 * Figma Icon Button: 40 / 50 / 56 px circular outlines, 72 px solid workout FAB.
 * Phase 1: Neutral & Primary, default/pressed/disabled. Warning, destructive,
 * and loading follow once their semantic states have been verified.
 */
export function RemusIconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 'medium',
  variant = 'primary',
  mode = 'athleteLight',
  disabled = false,
  testID,
}: RemusIconButtonProps) {
  const interaction = createIconButtonInteraction({
    accessibilityLabel,
    disabled,
    onPress,
  });
  const appearance = (pressed: boolean) => getIconButtonAppearance({
    size,
    variant,
    mode,
    disabled,
    pressed,
  });

  return (
    <Pressable
      testID={testID}
      {...interaction}
      hitSlop={size === 'small' ? 4 : undefined}
      style={({ pressed }) => [styles.button, appearance(pressed)]}
    >
      {({ pressed }) => (
        <RemusIcon
          name={icon}
          size={appearance(pressed).iconSize}
          strokeColor={appearance(pressed).iconColor}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
