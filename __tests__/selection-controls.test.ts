import {
  createSelectionInteraction,
  getCheckboxAppearance,
  getFilterChipAppearance,
  getRadioAppearance,
  getToggleAppearance,
  selectionControlGeometry,
} from '../src/design-system/atoms/selectionControlStyle';
import { colors } from '../src/design-system/tokens';

const modes = ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const;

describe('Selection Controls — Figma 10 Atoms (198:206)', () => {
  it('keeps all four atom hit targets and canonical dimensions', () => {
    expect(selectionControlGeometry.touchSize).toBe(44);
    expect(selectionControlGeometry.checkboxSize).toBe(24);
    expect(selectionControlGeometry.radioRadius).toBe(11);
    expect(selectionControlGeometry.radioDotRadius).toBe(6);
    expect(selectionControlGeometry.toggleWidth).toBe(52);
    expect(selectionControlGeometry.toggleTrackHeight).toBe(28);
    expect(selectionControlGeometry.chipMinWidth).toBe(96);
    expect(selectionControlGeometry.chipRadius).toBe(22);
  });

  it('uses semantic colors for unchecked and checked checkboxes in every theme', () => {
    for (const mode of modes) {
      const off = getCheckboxAppearance({ mode });
      const on = getCheckboxAppearance({ mode, checked: true });
      expect(off.borderColor).toBe(colors[mode].border);
      expect(off.backgroundColor).toBe(colors[mode].surface);
      expect(on.borderColor).toBe(colors[mode].primary);
      expect(on.backgroundColor).toBe(colors[mode].primary);
      expect(on.markColor).toBe(colors[mode].onPrimary);
    }
  });

  it('represents checkbox indeterminate with the mixed accessibility state', () => {
    const mixed = getCheckboxAppearance({ indeterminate: true });
    expect(mixed.checkedState).toBe('mixed');
    expect(mixed.backgroundColor).toBe(colors.athleteLight.primary);
    expect(getCheckboxAppearance({ checked: true }).checkedState).toBe(true);
    expect(getCheckboxAppearance().checkedState).toBe(false);
  });

  it('uses a dimmed disabled state without erasing selected check marks', () => {
    for (const mode of modes) {
      const off = getCheckboxAppearance({ mode, disabled: true });
      const on = getCheckboxAppearance({ mode, checked: true, disabled: true });
      expect(off.borderColor).toBe(colors[mode].disabled);
      expect(on.backgroundColor).toBe(colors[mode].primary);
      expect(off.opacity).toBe(0.5);
      expect(on.opacity).toBe(0.5);
    }
  });

  it('keeps radio outer ring and selected dot colors semantic', () => {
    for (const mode of modes) {
      expect(getRadioAppearance({ mode }).borderColor).toBe(colors[mode].border);
      expect(getRadioAppearance({ mode, selected: true }).borderColor).toBe(colors[mode].primary);
      expect(getRadioAppearance({ mode, selected: true }).dotColor).toBe(colors[mode].primary);
      expect(getRadioAppearance({ mode, disabled: true }).borderColor).toBe(colors[mode].disabled);
    }
  });

  it('moves the toggle knob to its precise Figma x coordinates', () => {
    for (const mode of modes) {
      const off = getToggleAppearance({ mode });
      const on = getToggleAppearance({ mode, value: true });
      expect(off.thumbCenterX).toBe(16);
      expect(on.thumbCenterX).toBe(36);
      expect(off.trackColor).toBe(colors[mode].disabled);
      expect(on.trackColor).toBe(colors[mode].primary);
      expect(on.thumbColor).toBe('#FFFFFF');
    }
  });

  it('keeps filter chip selected contour at 2 px and default at 1 px', () => {
    for (const mode of modes) {
      const off = getFilterChipAppearance({ mode });
      const on = getFilterChipAppearance({ mode, selected: true });
      expect(off.borderWidth).toBe(1);
      expect(off.borderColor).toBe(colors[mode].border);
      expect(on.borderWidth).toBe(2);
      expect(on.borderColor).toBe(colors[mode].primary);
      expect(off.textColor).toBe(colors[mode].text);
      expect(on.height).toBe(44);
    }
  });

  it('requires accessible name and exposes checkbox mixed semantics', () => {
    const mark = jest.fn();
    const props = createSelectionInteraction({
      kind: 'checkbox', label: 'Selecionar todos', indeterminate: true, onValueChange: mark,
    });
    expect(props.accessibilityRole).toBe('checkbox');
    expect(props.accessibilityLabel).toBe('Selecionar todos');
    expect(props.accessibilityState).toEqual({ checked: 'mixed', disabled: false });
    props.onPress?.();
    expect(mark).toHaveBeenCalledTimes(1);
    expect(mark.mock.calls[0][0]).toBe(true);
  });

  it('keeps radio choice true when selected and toggles switch and chips', () => {
    const radio = jest.fn();
    const toggle = jest.fn();
    const chip = jest.fn();
    createSelectionInteraction({ kind: 'radio', label: 'A', selected: true, onValueChange: radio }).onPress?.();
    createSelectionInteraction({ kind: 'switch', label: 'Recurso', selected: false, onValueChange: toggle }).onPress?.();
    createSelectionInteraction({ kind: 'chip', label: 'Treinos', selected: true, onValueChange: chip }).onPress?.();
    expect(radio.mock.calls[0][0]).toBe(true);
    expect(toggle.mock.calls[0][0]).toBe(true);
    expect(chip.mock.calls[0][0]).toBe(false);
  });

  it('uses native accessibility roles for radio/switch/chip', () => {
    expect(createSelectionInteraction({ kind: 'radio', label: 'B' }).accessibilityRole).toBe('radio');
    expect(createSelectionInteraction({ kind: 'switch', label: 'Ativar' }).accessibilityRole).toBe('switch');
    const chip = createSelectionInteraction({ kind: 'chip', label: 'Todos', selected: true });
    expect(chip.accessibilityRole).toBe('button');
    expect(chip.accessibilityState).toEqual({ selected: true, disabled: false });
  });

  it('blocks every disabled control even when a handler is supplied', () => {
    for (const kind of ['checkbox', 'radio', 'switch', 'chip'] as const) {
      const spy = jest.fn();
      const props = createSelectionInteraction({ kind, label: kind, disabled: true, onValueChange: spy });
      expect(props.disabled).toBe(true);
      expect(props.onPress).toBeUndefined();
      expect(props.accessibilityState.disabled).toBe(true);
    }
  });
});
