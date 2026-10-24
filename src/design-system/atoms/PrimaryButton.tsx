import React from 'react';
import { createPrimaryButtonInteraction } from './primaryButtonInteraction';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  colors,
  controlSize,
  radius,
  spacing,
  stroke,
  typography,
  type DesignColorMode,
} from '../tokens';

export type PrimaryButtonSize = 'small' | 'medium' | 'large';

export type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  size?: PrimaryButtonSize;
  mode?: DesignColorMode;
  disabled?: boolean;
  testID?: string;
};

const horizontalPadding = {
  small: spacing.md,
  medium: spacing.lg,
  large: spacing.xl,
} as const;

/**
 * Figma Button/Primary (76:14), default/pressed/disabled states.
 * Primary is OUTLINED in Remus, not filled. Icon/loading are separate increments.
 */
export function PrimaryButton({
  label,
  onPress,
  size = 'medium',
  mode = 'athleteLight',
  disabled = false,
  testID,
}: PrimaryButtonProps) {
  const palette = colors[mode];
  const height = controlSize[size];
  const interaction = createPrimaryButtonInteraction({ label, disabled, onPress });

  return (
    <Pressable
      testID={testID}
      {...interaction}
      hitSlop={size === 'small' ? 4 : 0}
      style={({ pressed }) => [
        styles.container,
        {
          height,
          paddingHorizontal: horizontalPadding[size],
          borderColor: disabled
            ? palette.disabled
            : pressed
              ? palette.primaryPressed
              : palette.primary,
          opacity: disabled ? 0.62 : 1,
        },
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.label,
            {
              fontSize: typography.button[size],
              color: disabled
                ? palette.disabled
                : pressed
                  ? palette.primaryPressed
                  : palette.primary,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: stroke.emphasis,
    borderRadius: radius.lg,
  },
  label: {
    fontWeight: typography.button.fontWeight,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
