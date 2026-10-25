import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {ObservabilityPreview} from '../src/observability/dev/ObservabilityPreview';
import {type TelemetryCollectionConsent} from '../src/observability/telemetry';

describe('Observability QA preview', () => {
  const enabled: TelemetryCollectionConsent = {analytics: true, crashReporting: true};
  const makeJournal = () => ({
    append: jest.fn().mockResolvedValue(undefined),
    read: jest.fn().mockResolvedValue([]),
    exportJson: jest.fn().mockResolvedValue('{"schemaVersion":1,"entries":[]}'),
  });

  it('applies collection choices and exposes the effective result', async () => {
    let current = enabled;
    const applyConsent = jest.fn(async (requested: TelemetryCollectionConsent) => {
      current = requested;
      return {requested, effective: requested, analytics: 'applied' as const, crashReporting: 'applied' as const};
    });
    const diagnostics = {trackEvent: jest.fn(), recordNonFatal: jest.fn()};
    const journal = makeJournal();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ObservabilityPreview mode="athleteLight"
        collectionControl={{readConsent: () => current, applyConsent}} diagnostics={diagnostics} journal={journal}/>);
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'observability-analytics-toggle'}).props.onValueChange(false);
      await Promise.resolve();
    });

    expect(applyConsent).toHaveBeenCalledWith({analytics: false, crashReporting: true});
    expect(renderer?.root.findByProps({testID: 'observability-last-result'}).props.children)
      .toContain('Analytics: aplicado');
    expect(journal.append).toHaveBeenCalledWith(expect.objectContaining({name: 'collection_consent_applied'}));
    await ReactTestRenderer.act(() => {renderer?.unmount();});
  });

  it('runs only controlled QA probes', async () => {
    const trackEvent = jest.fn().mockResolvedValue(true);
    const recordNonFatal = jest.fn().mockResolvedValue(true);
    const journal = makeJournal();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ObservabilityPreview mode="athleteLight"
        collectionControl={{
          readConsent: () => enabled,
          applyConsent: jest.fn(),
        }} diagnostics={{trackEvent, recordNonFatal}} journal={journal}/>);
      await Promise.resolve();
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
    expect(journal.append).toHaveBeenCalledWith({
      name: 'qa_probe_completed', channel: 'crash_reporting', outcome: 'accepted',
    });
    expect(renderer?.root.findByProps({testID: 'observability-last-result'}).props.children)
      .toBe('Non-fatal QA aceito.');
    await ReactTestRenderer.act(() => {renderer?.unmount();});
  });
});
