import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {ObservabilityPreview} from '../src/observability/dev/ObservabilityPreview';
import {type TelemetryCollectionConsent} from '../src/observability/telemetry';

describe('Observability QA preview', () => {
  const enabled: TelemetryCollectionConsent = {analytics: true, crashReporting: true};

  it('applies collection choices and exposes the effective result', async () => {
    let current = enabled;
    const applyConsent = jest.fn(async (requested: TelemetryCollectionConsent) => {
      current = requested;
      return {requested, effective: requested, analytics: 'applied' as const, crashReporting: 'applied' as const};
    });
    const diagnostics = {trackEvent: jest.fn(), recordNonFatal: jest.fn()};
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ObservabilityPreview mode="athleteLight"
        collectionControl={{readConsent: () => current, applyConsent}} diagnostics={diagnostics}/>);
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'observability-analytics-toggle'}).props.onValueChange(false);
      await Promise.resolve();
    });

    expect(applyConsent).toHaveBeenCalledWith({analytics: false, crashReporting: true});
    expect(renderer?.root.findByProps({testID: 'observability-last-result'}).props.children)
      .toContain('Analytics: aplicado');
    await ReactTestRenderer.act(() => {renderer?.unmount();});
  });

  it('runs only controlled QA probes', async () => {
    const trackEvent = jest.fn().mockResolvedValue(true);
    const recordNonFatal = jest.fn().mockResolvedValue(true);
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ObservabilityPreview mode="athleteLight"
        collectionControl={{
          readConsent: () => enabled,
          applyConsent: jest.fn(),
        }} diagnostics={{trackEvent, recordNonFatal}}/>);
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'observability-event-probe'}).props.onPress();
      await Promise.resolve();
    });
    expect(trackEvent).toHaveBeenCalledWith({name: 'remus_qa_observability_probe'});

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'observability-nonfatal-probe'}).props.onPress();
      await Promise.resolve();
    });
    expect(recordNonFatal).toHaveBeenCalledWith(expect.objectContaining({message: 'REMUS QA non-fatal probe'}));
    expect(renderer?.root.findByProps({testID: 'observability-last-result'}).props.children)
      .toBe('Non-fatal QA aceito.');
    await ReactTestRenderer.act(() => {renderer?.unmount();});
  });
});
