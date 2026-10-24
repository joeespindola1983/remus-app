import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { createSelectionInteraction, getToggleAppearance, selectionControlGeometry } from './selectionControlStyle';

export type RemusToggleProps = {
  value?: boolean;
  disabled?: boolean;
  mode?: DesignColorMode;
  accessibilityLabel: string;
  onValueChange?: (value: boolean) => void;
  testID?: string;
};

/** Figma Atom/Toggle 298:6259; canonical 52×44 px SVG and native switch semantics. */
export function RemusToggle({
  value = false, disabled = false, mode = 'athleteLight',
  accessibilityLabel, onValueChange, testID,
}: RemusToggleProps) {
  const appearance = getToggleAppearance({ value, disabled, mode });
  const interaction = createSelectionInteraction({
    kind: 'switch', label: accessibilityLabel, selected: value, disabled, onValueChange,
  });
  return (
    <Pressable {...interaction} testID={testID} style={[styles.touchTarget, disabled ? styles.disabled : undefined]}>
      <Svg width={52} height={44} viewBox="0 0 52 44" fill="none" accessible={false}>
        <Rect x={2.5} y={8.5} width={47} height={27} rx={13.5}
          fill={appearance.trackColor} stroke={appearance.trackColor} strokeWidth={1} />
        <Circle cx={appearance.thumbCenterX} cy={22} r={11} fill={appearance.thumbColor} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    width: selectionControlGeometry.toggleWidth,
    height: selectionControlGeometry.touchSize,
  },
  disabled: { opacity: 0.5 },
});
