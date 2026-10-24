import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { createSelectionInteraction, getCheckboxAppearance, selectionControlGeometry } from './selectionControlStyle';

export type RemusCheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  mode?: DesignColorMode;
  accessibilityLabel: string;
  onValueChange?: (checked: boolean) => void;
  testID?: string;
};

/** Figma Atom/Checkbox 304:6788; native interaction, 44px target. */
export function RemusCheckbox({
  checked = false, indeterminate = false, disabled = false,
  mode = 'athleteLight', accessibilityLabel, onValueChange, testID,
}: RemusCheckboxProps) {
  const appearance = getCheckboxAppearance({ checked, indeterminate, disabled, mode });
  const interaction = createSelectionInteraction({
    kind: 'checkbox', label: accessibilityLabel, selected: checked,
    indeterminate, disabled, onValueChange,
  });
  return (
    <Pressable {...interaction} testID={testID} style={[styles.touchTarget, disabled ? styles.disabled : undefined]}>
      <Svg width={44} height={44} viewBox="0 0 44 44" fill="none" accessible={false}>
        <Path
          d="M14 11H30C31.6569 11 33 12.3431 33 14V30C33 31.6569 31.6569 33 30 33H14C12.3431 33 11 31.6569 11 30V14C11 12.3431 12.3431 11 14 11Z"
          fill={appearance.backgroundColor} stroke={appearance.borderColor} strokeWidth={2}
        />
        {indeterminate && (
          <Rect x={16} y={21} width={12} height={2} rx={1} fill={appearance.markColor} />
        )}
        {checked && !indeterminate && (
          <>
            <Rect x={17} y={18} width={11} height={5} rx={1} transform="rotate(45 17 18)" fill={appearance.markColor} />
            <Rect x={29.4297} y={21.6346} width={11} height={5} rx={1} transform="rotate(136.629 29.4297 21.6346)" fill={appearance.markColor} />
          </>
        )}
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
