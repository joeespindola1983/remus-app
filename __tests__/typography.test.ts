import { getRemusTextStyle, normalizeTextPlatform } from '../src/design-system/atoms/remusTextStyle';
import { typographyScale } from '../src/design-system/tokens';

describe('Remus Typography — Figma contract (20:4)', () => {
  it('normalizes all supported React Native operating systems', () => {
    expect(normalizeTextPlatform('ios')).toBe('ios');
    expect(normalizeTextPlatform('android')).toBe('android');
    expect(normalizeTextPlatform('windows')).toBe('other');
    expect(normalizeTextPlatform('macos')).toBe('other');
    expect(normalizeTextPlatform('web')).toBe('other');
  });

  it('defines the eight canonical text styles', () => {
    expect(typographyScale).toEqual({
      h1: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
      h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
      h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
      h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
      body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
      bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
      caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
      small: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    });
  });

  it('uses native SF Pro on iOS and Roboto on Android', () => {
    const ios = getRemusTextStyle({ variant: 'h1', platform: 'ios' });
    const android = getRemusTextStyle({ variant: 'h1', platform: 'android' });
    expect(ios.fontFamily).toBeUndefined();
    expect(android.fontFamily).toBe('Roboto');
    expect(android.fontSize).toBe(ios.fontSize);
    expect(android.lineHeight).toBe(ios.lineHeight);
    expect(android.fontWeight).toBe(ios.fontWeight);
  });

  it('resolves text colors from the selected semantic mode', () => {
    expect(getRemusTextStyle({ variant: 'body', platform: 'ios' }).color)
      .toBe('#111827');
    expect(getRemusTextStyle({ variant: 'body', mode: 'athleteDark', platform: 'ios' }).color)
      .toBe('#F9FAFB');
    expect(getRemusTextStyle({ variant: 'caption', mode: 'athleteDark', tone: 'secondary', platform: 'android' }).color)
      .toBe('#D1D5DB');
  });
});
