import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { getAvatarAppearance, type AvatarSize } from './remusPresentationStyle';

export type RemusAvatarProps = {
  initials: string;
  size?: AvatarSize;
  mode?: DesignColorMode;
  accessibilityLabel?: string;
  testID?: string;
};

/** Figma Atom/Avatar 287:3686. The placeholder uses initials until a profile image is available. */
export function RemusAvatar({
  initials, size = 'medium', mode = 'athleteLight', accessibilityLabel, testID,
}: RemusAvatarProps) {
  const look = getAvatarAppearance({ size, mode });
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Avatar ${initials}`}
      style={[styles.avatar, {
        width: look.diameter,
        height: look.diameter,
        borderRadius: look.borderRadius,
        borderColor: look.borderColor,
        backgroundColor: look.backgroundColor,
      }]}
    >
      <Text
        numberOfLines={1}
        style={[styles.initials, { fontSize: look.fontSize, lineHeight: look.lineHeight, color: look.textColor }]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
  initials: { fontWeight: '700', textAlign: 'center' },
});
