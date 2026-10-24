import { StyleSheet } from 'react-native';
import { colors, type DesignColorMode } from '../tokens';

export const moleculeGeometry = {
  metricCompact: 144,
  metricRegular: 148,
  contentWidth: 342,
  metricHeight: 84,
  cardRadius: 16,
  contentGap: 12,
  sourceRowHeight: 76,
  progressHeight: 8,
} as const;

export type MoleculeMode = DesignColorMode;
export type MoleculeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'critical' | 'accent';

export function moleculePalette(mode: MoleculeMode = 'athleteLight') {
  const theme = colors[mode];
  const dark = mode.endsWith('Dark');
  return {
    ...theme,
    mutedSurface: dark ? '#273449' : '#F9FAFB',
    mutedBackground: dark ? '#374151' : '#F3F4F6',
    successSurface: dark ? '#064E3B' : '#D1FAE5',
    warningSurface: dark ? '#78350F' : '#FEF3C7',
    criticalSurface: dark ? '#7F1D1D' : '#FEE2E2',
    onMedia: '#FFFFFF',
  };
}

export function toneColor(tone: MoleculeTone, mode: MoleculeMode) {
  const c = moleculePalette(mode);
  switch (tone) {
    case 'primary': return c.primary;
    case 'success': return c.success;
    case 'warning': return c.warning;
    case 'critical': return c.destructive;
    case 'accent': return c.accent;
    default: return c.secondaryText;
  }
}

export function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

export function semanticProgress(value: number, maximum: number): number {
  return maximum > 0 ? clampPercent((value / maximum) * 100) : 0;
}

export const moleculeStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8, alignSelf: 'stretch' },
  softCard: { borderRadius: 14, padding: 14, gap: 8, alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  column: { flexDirection: 'column', gap: 6, flexShrink: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  text: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  strong: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  big: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
  metricLabel: { fontSize: 10, lineHeight: 14, fontWeight: '600', textTransform: 'uppercase' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 8, width: '100%', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  selection: { borderWidth: 2 },
  disabled: { opacity: 0.48 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  overlay: { minHeight: 220, padding: 20, justifyContent: 'flex-end', gap: 8, borderRadius: 16 },
  mapControl: { width: 50, height: 50, borderWidth: 2, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  mapStack: { gap: 12, alignItems: 'center' },
  mediaSquare: { width: 180, height: 180, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 10 },
  mediaPortrait: { width: 180, height: 225, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 10 },
  source: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  liveMetricPortrait: { width: 174, minHeight: 226, padding: 16, justifyContent: 'space-between', borderWidth: 1 },
  liveMetricLandscape: { width: 292, minHeight: 136, padding: 16, justifyContent: 'space-between', borderWidth: 1 },
  liveValue: { fontSize: 56, lineHeight: 60, fontWeight: '700' },
});
