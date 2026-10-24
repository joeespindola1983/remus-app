import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { getSourceBadgeAppearance, type CaptureSource } from './remusChartCaptureStyle';

const labels: Record<CaptureSource, string> = {
  rbp1: 'Remus Black Box', phone: 'Celular', watch: 'Relógio', instrument: 'Instrumento',
};

/** Figma 499:25. Four 44×44 visual source labels; no source identity detection. */
export function RemusSourceBadge({ source, mode = 'athleteLight', testID }:
  { source: CaptureSource; mode?: DesignColorMode; testID?: string }) {
  const look = getSourceBadgeAppearance(source, mode);
  return (
    <View testID={testID} accessible accessibilityRole="text" accessibilityLabel={labels[source]}
      style={[styles.badge, { backgroundColor: look.backgroundColor }]}>
      <Text style={[styles.letter, { color: look.textColor }]}>{look.letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
});
