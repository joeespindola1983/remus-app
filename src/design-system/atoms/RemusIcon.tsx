import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import {
  getRemusIconDefinition,
  type RemusIconName,
  type RemusIconTone,
} from './remusIconDefinition';

export type RemusIconProps = {
  name: RemusIconName;
  /** The Figma master canvas is 32×32. */
  size?: number;
  mode?: DesignColorMode;
  tone?: RemusIconTone;
  /** An already-resolved semantic stroke color, for composed controls. */
  strokeColor?: string;
  /** Omit for decorative icons; use a meaningful name when informative. */
  accessibilityLabel?: string;
  testID?: string;
};

/** Figma icon geometry rendered natively with react-native-svg. */
export function RemusIcon({
  name,
  size = 32,
  mode = 'athleteLight',
  tone = 'primary',
  strokeColor,
  accessibilityLabel,
  testID,
}: RemusIconProps) {
  const { path, color, strokeWidth } = getRemusIconDefinition({ name, mode, tone });

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Path
        d={path}
        stroke={strokeColor ?? color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
