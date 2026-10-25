import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import {
  getConditionStatusAppearance,
  presentationGeometry,
  type ConditionStatus,
} from './remusPresentationStyle';

export type RemusConditionStatusProps = {
  status: ConditionStatus;
  mode?: DesignColorMode;
  testID?: string;
};

/** Figma Atom/Condition Status 255:206. Informative badge, not a button. */
export function RemusConditionStatus({ status, mode, testID }: RemusConditionStatusProps) {
  const look = getConditionStatusAppearance({ status, mode });
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={look.label}
      style={[styles.container, {
        borderColor: look.borderColor,
        backgroundColor: look.backgroundColor,
      }]}
    >
      <View style={[styles.dot, { backgroundColor: look.dotColor }]} />
      <Text style={[styles.label, { color: look.textColor }]}>{look.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: presentationGeometry.statusPaddingHorizontal,
    paddingVertical: presentationGeometry.statusPaddingVertical,
  },
  dot: {
    width: presentationGeometry.statusDot,
    height: presentationGeometry.statusDot,
    borderRadius: presentationGeometry.statusDot / 2,
  },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
});
