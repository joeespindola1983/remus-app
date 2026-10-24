import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { createSelectionInteraction, getRadioAppearance, selectionControlGeometry } from './selectionControlStyle';

export type RemusRadioProps = {
  selected?: boolean;
  disabled?: boolean;
  mode?: DesignColorMode;
  accessibilityLabel: string;
  onSelect?: () => void;
  testID?: string;
};

/** Figma Atom/Radio 304:6796; one radio per option, choice state owned by parent. */
export function RemusRadio({
  selected = false, disabled = false, mode = 'athleteLight',
  accessibilityLabel, onSelect, testID,
}: RemusRadioProps) {
  const appearance = getRadioAppearance({ selected, disabled, mode });
  const interaction = createSelectionInteraction({
    kind: 'radio', label: accessibilityLabel, selected, disabled,
    onValueChange: () => onSelect?.(),
  });
  return (
    <Pressable {...interaction} testID={testID} style={[styles.touchTarget, disabled ? styles.disabled : undefined]}>
      <Svg width={44} height={44} viewBox="0 0 44 44" fill="none" accessible={false}>
        <Circle cx={22} cy={22} r={11} fill={appearance.backgroundColor} stroke={appearance.borderColor} strokeWidth={2} />
        {selected && <Circle cx={22} cy={22} r={6} fill={appearance.dotColor} />}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    width: selectionControlGeometry.touchSize,
    height: selectionControlGeometry.touchSize,
  },
  disabled: { opacity: 0.5 },
});
