import {
  chartMarkKinds, chartRuleKinds, chartExamplePath, chartBarGeometry,
  getChartAppearance, getBatteryAppearance, getSourceBadgeAppearance,
  getCaptureFabAppearance, createCaptureFabInteraction, batteryConditions, sourceTypes,
} from '../src/design-system/atoms/remusChartCaptureStyle';

const modes = ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const;

describe('Chart and Capture Atoms (Figma 330:2 and 499:2)', () => {
  it('preserves the six chart marks and four chart rules', () => {
    expect(chartMarkKinds).toEqual(['line', 'area', 'bar', 'range', 'historical', 'secondary']);
    expect(chartRuleKinds).toEqual(['grid', 'reference', 'selection', 'threshold']);
    expect(chartExamplePath).toBe('M16 64C40 66 54 40 78 46C102 52 116 30 140 40C164 50 176 22 204 28');
    expect(chartBarGeometry).toHaveLength(6);
  });
  it('resolves chart semantic colors for all four modes', () => {
    modes.forEach(mode => {
      const a = getChartAppearance(mode);
      expect(a.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(a.grid).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(a.threshold).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
  it('uses only source-reported battery condition and 26×16 geometry', () => {
    expect(batteryConditions).toEqual(['good', 'low', 'critical', 'unknown']);
    modes.forEach(mode => batteryConditions.forEach(condition => {
      const a = getBatteryAppearance(condition, mode);
      expect(a.width).toBe(26);
      expect(a.height).toBe(16);
      expect(a.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }));
    expect(getBatteryAppearance('good').levelWidth).toBe(14);
    expect(getBatteryAppearance('unknown').levelWidth).toBe(0);
  });
  it('preserves four distinct source badge letters', () => {
    expect(sourceTypes).toEqual(['rbp1', 'phone', 'watch', 'instrument']);
    expect(sourceTypes.map(source => getSourceBadgeAppearance(source).letter)).toEqual(['R','P','W','S']);
    expect(getSourceBadgeAppearance('phone').size).toBe(44);
  });
  it('distinguishes filled Finish from outlined Pause', () => {
    modes.forEach(mode => {
      const p = getCaptureFabAppearance('pause', mode);
      const f = getCaptureFabAppearance('finish', mode);
      expect(p.diameter).toBe(64);
      expect(p.borderWidth).toBe(2);
      expect(f.borderWidth).toBe(0);
      expect(f.symbolColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
  it('guards capture actions when disabled and exposes an accessible label', () => {
    const onPress = jest.fn();
    const live = createCaptureFabInteraction({ action: 'pause', accessibilityLabel: 'Pausar', onPress });
    expect(live.accessibilityLabel).toBe('Pausar');
    live.onPress?.();
    expect(onPress).toHaveBeenCalledTimes(1);
    const blocked = createCaptureFabInteraction({ action: 'finish', accessibilityLabel: 'Finalizar', disabled: true, onPress });
    expect(blocked.accessibilityState).toEqual({ disabled: true });
    expect(blocked.onPress).toBeUndefined();
  });
});
