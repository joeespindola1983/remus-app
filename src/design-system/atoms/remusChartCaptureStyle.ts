import { colors, type DesignColorMode } from '../tokens';

/** Chart specimens only. Data-driven rendering belongs to the chart molecule. */
export const chartMarkKinds = ['line', 'area', 'bar', 'range', 'historical', 'secondary'] as const;
export type ChartMarkKind = typeof chartMarkKinds[number];
export const chartRuleKinds = ['grid', 'reference', 'selection', 'threshold'] as const;
export type ChartRuleKind = typeof chartRuleKinds[number];

export type BatteryCondition = 'good' | 'low' | 'critical' | 'unknown';
export const batteryConditions: readonly BatteryCondition[] = ['good', 'low', 'critical', 'unknown'];
export const sourceTypes = ['rbp1', 'phone', 'watch', 'instrument'] as const;
export type CaptureSource = typeof sourceTypes[number];
export type CaptureAction = 'pause' | 'finish';

export const chartExamplePath = 'M16 64C40 66 54 40 78 46C102 52 116 30 140 40C164 50 176 22 204 28';
export const chartBarGeometry = [
  { x: 22, y: 52, width: 20, height: 28 },
  { x: 53, y: 38, width: 20, height: 42 },
  { x: 84, y: 44, width: 20, height: 36 },
  { x: 115, y: 22, width: 20, height: 58 },
  { x: 146, y: 30, width: 20, height: 50 },
  { x: 177, y: 12, width: 20, height: 68 },
] as const;

export function getChartAppearance(mode: DesignColorMode = 'athleteLight') {
  const c = colors[mode];
  return { primary: c.primary, secondary: c.accent, historical: c.secondaryText,
    grid: c.border, threshold: c.warning };
}

export function getBatteryAppearance(condition: BatteryCondition, mode: DesignColorMode = 'athleteLight') {
  const c = colors[mode];
  const color = condition === 'good' ? c.success : condition === 'low' ? c.warning
    : condition === 'critical' ? c.feedbackError : c.secondaryText;
  return { color, levelWidth: condition === 'good' ? 14 : condition === 'low' ? 7
    : condition === 'critical' ? 3 : 0, width: 26, height: 16 };
}

export function getSourceBadgeAppearance(source: CaptureSource, mode: DesignColorMode = 'athleteLight') {
  return { letter: ({ rbp1: 'R', phone: 'P', watch: 'W', instrument: 'S' } as const)[source],
    backgroundColor: colors[mode].surface, textColor: colors[mode].text, size: 44 };
}

export function getCaptureFabAppearance(action: CaptureAction, mode: DesignColorMode = 'athleteLight') {
  const c = colors[mode];
  return { diameter: 64, backgroundColor: action === 'pause' ? c.surface : c.destructive,
    borderColor: action === 'pause' ? c.primary : 'transparent', borderWidth: action === 'pause' ? 2 : 0,
    symbolColor: action === 'pause' ? c.primary : c.surface };
}

export function createCaptureFabInteraction(options:
  { action: CaptureAction; accessibilityLabel: string; disabled?: boolean; onPress?: () => void }) {
  const { accessibilityLabel, disabled = false, onPress } = options;
  return { accessibilityRole: 'button' as const, accessibilityLabel, accessibilityState: { disabled },
    disabled, onPress: disabled ? undefined : onPress };
}
