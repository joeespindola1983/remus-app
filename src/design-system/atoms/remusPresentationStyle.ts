import { colors, type DesignColorMode } from '../tokens';

/** Figma: Weather 251:206, Identity 287:3681, Navigation 321:2. */
export const presentationGeometry = {
  statusDot: 10,
  statusPaddingHorizontal: 16,
  statusPaddingVertical: 8,
  avatarMedium: 48,
  avatarLarge: 64,
  navigationWidth: 88,
  navigationHeight: 64,
  navigationIcon: 28,
  navigationIndicatorWidth: 28,
  navigationIndicatorHeight: 3,
} as const;

export type ConditionStatus = 'best' | 'good' | 'caution' | 'notRecommended' | 'uncertain';
export type AvatarSize = 'medium' | 'large';

const statusLabels: Record<ConditionStatus, string> = {
  best: 'Best',
  good: 'Good',
  caution: 'Caution',
  notRecommended: 'Not Recommended',
  uncertain: 'Uncertain',
};

export function getConditionStatusAppearance({
  status, mode = 'athleteLight',
}: { status: ConditionStatus; mode?: DesignColorMode }) {
  const theme = colors[mode];
  const statusColors = {
    best: theme.success,
    good: theme.accent,
    caution: theme.warning,
    notRecommended: theme.destructive,
    uncertain: theme.secondaryText,
  };
  return {
    label: statusLabels[status],
    dotColor: statusColors[status],
    borderColor: statusColors[status],
    backgroundColor: theme.surface,
    textColor: theme.text,
    dotSize: presentationGeometry.statusDot,
  };
}

export function getAvatarAppearance({
  size = 'medium', mode = 'athleteLight',
}: { size?: AvatarSize; mode?: DesignColorMode } = {}) {
  const theme = colors[mode];
  const diameter = size === 'large' ? presentationGeometry.avatarLarge : presentationGeometry.avatarMedium;
  return {
    diameter,
    borderRadius: diameter / 2,
    fontSize: size === 'large' ? 24 : 18,
    lineHeight: size === 'large' ? 32 : 24,
    borderColor: theme.primary,
    backgroundColor: theme.avatarSurface,
    textColor: theme.text,
  };
}

export function getNavigationItemAppearance({
  selected = false, disabled = false, mode = 'athleteLight',
}: { selected?: boolean; disabled?: boolean; mode?: DesignColorMode } = {}) {
  const theme = colors[mode];
  return {
    iconColor: disabled ? theme.disabled : selected ? theme.primary : theme.accent,
    labelColor: disabled ? theme.disabled : selected ? theme.text : theme.secondaryText,
    indicatorColor: theme.primary,
    labelWeight: selected ? '600' as const : '400' as const,
    opacity: disabled ? 0.48 : 1,
    showIndicator: selected && !disabled,
  };
}

/** Accessibility and tap behavior are kept testable without a React renderer. */
export function createNavigationItemInteraction({
  label, selected = false, disabled = false, onPress,
}: { label: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) {
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityState: { selected, disabled },
    disabled,
    onPress: disabled ? undefined : onPress,
  };
}
