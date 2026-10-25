import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RemusSourceStatusRow } from '../src/design-system/molecules/RemusCaptureMolecules';

describe('REMUS capture molecules', () => {
  it('renders the badge for the source supplied by the caller', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RemusSourceStatusRow
          name="Celular"
          detail="GPS"
          source="phone"
          state="recording"
          testID="phone-source"
        />,
      );
    });

    expect(renderer?.root.findByProps({accessibilityLabel: 'Celular'})).toBeDefined();
    await ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
