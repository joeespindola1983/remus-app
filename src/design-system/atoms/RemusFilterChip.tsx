import React from 'react';
import { Pressable, Text } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { createSelectionInteraction, getFilterChipAppearance } from './selectionControlStyle';

export type RemusFilterChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  mode?: DesignColorMode;
  onValueChange?: (selected: boolean) => void;
  testID?: string;
};

/** Figma Atom/Filter Chip 297:5388; 44px height, 96px minimum width. */
export function RemusFilterChip({
  label, selected = false, disabled = false, mode = 'athleteLight',
  onValueChange, testID,
}: RemusFilterChipProps) {
  const appearance = getFilterChipAppearance({ selected, disabled, mode });
  const interaction = createSelectionInteraction({
    kind: 'chip', label, selected, disabled, onValueChange,
  });
  return (
    <Pressable
      {...interaction}
      testID={testID}
      style={({ pressed }) => ({
        height: appearance.height,
        minWidth: appearance.minWidth,
        borderRadius: appearance.borderRadius,
        borderWidth: appearance.borderWidth,
        borderColor: appearance.borderColor,
        backgroundColor: appearance.backgroundColor,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
      })}
    >
      <Text style={{ color: appearance.textColor, fontSize: appearance.fontSize, fontWeight: appearance.fontWeight }}>
        {label}
      </Text>
    </Pressable>
  );
}
