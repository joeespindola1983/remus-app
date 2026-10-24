import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { type DesignColorMode, type TypographyVariant } from '../tokens';
import { getRemusTextStyle, normalizeTextPlatform, type RemusTextTone } from './remusTextStyle';

export type RemusTextProps = TextProps & {
  variant: TypographyVariant;
  mode?: DesignColorMode;
  tone?: RemusTextTone;
};

/**
 * Figma: 03 Foundations — Typography (20:4).
 * Styles are platform-aware; system dynamic font scaling remains enabled.
 */
export function RemusText({
  variant,
  mode = 'athleteLight',
  tone = 'primary',
  style,
  children,
  ...textProps
}: RemusTextProps) {
  return (
    <Text
      {...textProps}
      style={[
        getRemusTextStyle({ variant, mode, tone, platform: normalizeTextPlatform(Platform.OS) }),
        style,
      ]}
    >
      {children}
    </Text>
  );
}
