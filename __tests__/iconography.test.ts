import {
  getRemusIconDefinition,
  remusIconGeometry,
} from '../src/design-system/atoms/remusIconDefinition';

describe('Remus Iconography (Figma 46:2)', () => {
  it('preserves the eight original icons and validates all registered 32×32 geometries', () => {
    const originalIcons = [
      'home', 'chevronRight', 'close', 'plus',
      'check', 'start', 'pause', 'stop',
    ] as const;
    originalIcons.forEach(name => {
      expect(name in remusIconGeometry).toBe(true);
    });
    Object.values(remusIconGeometry).forEach(icon => {
      expect(icon.path.length).toBeGreaterThan(8);
      expect(icon.strokeWidth).toBeGreaterThanOrEqual(2);
      expect(icon.strokeWidth).toBeLessThanOrEqual(2.7);
      expect(icon.figmaNodeId).toMatch(/^\d+:\d+$/);
    });
    expect(remusIconGeometry.start.path).toBe(
      'M9.33337 5.33325L25.3334 15.9999L9.33337 26.6666V5.33325Z',
    );
  });

  it('resolves semantic icon colors for both athlete modes', () => {
    expect(getRemusIconDefinition({ name: 'home', mode: 'athleteLight' }).color).toBe('#3B82F6');
    expect(getRemusIconDefinition({ name: 'home', mode: 'athleteDark' }).color).toBe('#60A5FA');
    expect(getRemusIconDefinition({ name: 'check', mode: 'athleteLight', tone: 'secondary' }).color).toBe('#0EA5E9');
    expect(getRemusIconDefinition({ name: 'check', mode: 'athleteDark', tone: 'secondary' }).color).toBe('#38BDF8');
  });

  it('uses the same semantic contract for admin modes and inverse tones', () => {
    expect(getRemusIconDefinition({ name: 'start', mode: 'adminLight' }).color).toBe('#DC2626');
    expect(getRemusIconDefinition({ name: 'start', mode: 'adminDark' }).color).toBe('#FCA5A5');
    expect(getRemusIconDefinition({ name: 'start', mode: 'athleteLight', tone: 'inverse' }).color).toBe('#FFFFFF');
    expect(getRemusIconDefinition({ name: 'start', mode: 'athleteDark', tone: 'inverse' }).color).toBe('#111827');
  });
});
