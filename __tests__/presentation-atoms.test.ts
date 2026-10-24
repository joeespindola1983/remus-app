import {
  createNavigationItemInteraction,
  getAvatarAppearance,
  getConditionStatusAppearance,
  getNavigationItemAppearance,
  presentationGeometry,
} from '../src/design-system/atoms/remusPresentationStyle';
import { colors } from '../src/design-system/tokens';

const modes = ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const;

describe('Presentation atoms — Figma Weather, Identity and Navigation', () => {
  it('preserves Avatar and Navigation geometry from canonical source', () => {
    expect(presentationGeometry.avatarMedium).toBe(48);
    expect(presentationGeometry.avatarLarge).toBe(64);
    expect(presentationGeometry.navigationWidth).toBe(88);
    expect(presentationGeometry.navigationHeight).toBe(64);
    expect(presentationGeometry.navigationIcon).toBe(28);
    expect(presentationGeometry.navigationIndicatorHeight).toBe(3);
    expect(presentationGeometry.statusDot).toBe(10);
  });

  it('covers all five condition status semantics in each theme', () => {
    for (const mode of modes) {
      const theme = colors[mode];
      expect(getConditionStatusAppearance({ status: 'best', mode }).dotColor).toBe(theme.success);
      expect(getConditionStatusAppearance({ status: 'good', mode }).dotColor).toBe(theme.accent);
      expect(getConditionStatusAppearance({ status: 'caution', mode }).dotColor).toBe(theme.warning);
      expect(getConditionStatusAppearance({ status: 'notRecommended', mode }).dotColor).toBe(theme.destructive);
      expect(getConditionStatusAppearance({ status: 'uncertain', mode }).dotColor).toBe(theme.secondaryText);
      expect(getConditionStatusAppearance({ status: 'notRecommended', mode }).label).toBe('Not Recommended');
    }
  });

  it('uses semantic colors and 18/24px initials in avatar placeholders', () => {
    for (const mode of modes) {
      const small = getAvatarAppearance({ mode });
      const large = getAvatarAppearance({ size: 'large', mode });
      expect(small.diameter).toBe(48);
      expect(large.diameter).toBe(64);
      expect(small.fontSize).toBe(18);
      expect(large.fontSize).toBe(24);
      expect(small.borderColor).toBe(colors[mode].primary);
      expect(large.backgroundColor).toBe(colors[mode].avatarSurface);
    }
  });

  it('uses semantic navigation colors and selected underline', () => {
    for (const mode of modes) {
      const regular = getNavigationItemAppearance({ mode });
      const selected = getNavigationItemAppearance({ selected: true, mode });
      const disabled = getNavigationItemAppearance({ disabled: true, mode });
      expect(regular.iconColor).toBe(colors[mode].accent);
      expect(selected.iconColor).toBe(colors[mode].primary);
      expect(selected.labelColor).toBe(colors[mode].text);
      expect(selected.showIndicator).toBe(true);
      expect(disabled.showIndicator).toBe(false);
      expect(disabled.opacity).toBe(0.48);
    }
  });

  it('exposes accessible label/selected state and blocks disabled navigation', () => {
    const onPress = jest.fn();
    const selected = createNavigationItemInteraction({label:'Home',selected:true,onPress});
    expect(selected.accessibilityRole).toBe('button');
    expect(selected.accessibilityState).toEqual({ selected:true, disabled:false });
    selected.onPress?.();
    expect(onPress).toHaveBeenCalledTimes(1);
    const disabled = createNavigationItemInteraction({label:'Indisponível',disabled:true,onPress});
    expect(disabled.accessibilityState.disabled).toBe(true);
    expect(disabled.onPress).toBeUndefined();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
