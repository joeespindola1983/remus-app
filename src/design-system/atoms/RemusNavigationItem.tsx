import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { RemusIcon } from './RemusIcon';
import { type RemusIconName } from './remusIconDefinition';
import {
  createNavigationItemInteraction,
  getNavigationItemAppearance,
  presentationGeometry,
} from './remusPresentationStyle';

export type RemusNavigationItemProps = {
  icon: RemusIconName;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  mode?: DesignColorMode;
  onPress?: () => void;
  testID?: string;
};

/** Figma Atom/Navigation Item 322:23 — 88×64 dp with a 28px icon. */
export function RemusNavigationItem({
  icon, label, selected = false, disabled = false, mode = 'athleteLight',
  onPress, testID,
}: RemusNavigationItemProps) {
  const look = getNavigationItemAppearance({ selected, disabled, mode });
  const interaction = createNavigationItemInteraction({ label, selected, disabled, onPress });
  return (
    <Pressable
      testID={testID}
      {...interaction}
      style={[styles.container, { opacity: look.opacity }]}
    >
      <RemusIcon name={icon} mode={mode} size={presentationGeometry.navigationIcon} strokeColor={look.iconColor} />
      <Text style={[styles.label, { color: look.labelColor, fontWeight: look.labelWeight }]}>
        {label}
      </Text>
      {look.showIndicator ? <View style={[styles.indicator, { backgroundColor: look.indicatorColor }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: presentationGeometry.navigationWidth,
    height: presentationGeometry.navigationHeight,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  label: { fontSize: 11, lineHeight: 14, textAlign: 'center' },
  indicator: {
    width: presentationGeometry.navigationIndicatorWidth,
    height: presentationGeometry.navigationIndicatorHeight,
    borderRadius: 2,
  },
});
