import {
  createTelemetryCollectionControl,
  type TelemetryCollectionAdapter,
} from '../src/observability/telemetryCollectionControl';

describe('Telemetry collection control', () => {
  const makeAdapter = (): jest.Mocked<TelemetryCollectionAdapter> => ({
    setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    setCrashReportingCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  });

  it('applies independent Analytics and crash-reporting choices', async () => {
    const adapter = makeAdapter();
    const control = createTelemetryCollectionControl(adapter);

    await expect(control.applyConsent({analytics: true, crashReporting: false})).resolves.toEqual({
      requested: {analytics: true, crashReporting: false},
      effective: {analytics: true, crashReporting: false},
      analytics: 'applied',
      crashReporting: 'applied',
    });
    expect(control.readConsent()).toEqual({analytics: true, crashReporting: false});
    expect(adapter.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(true);
    expect(adapter.setCrashReportingCollectionEnabled).toHaveBeenCalledWith(false);
  });

  it('fails closed per channel when an SDK update fails', async () => {
    const adapter = makeAdapter();
    adapter.setAnalyticsCollectionEnabled.mockRejectedValueOnce(new Error('native unavailable'));
    const control = createTelemetryCollectionControl(adapter);

    await expect(control.applyConsent({analytics: true, crashReporting: true})).resolves.toEqual({
      requested: {analytics: true, crashReporting: true},
      effective: {analytics: false, crashReporting: true},
      analytics: 'failed',
      crashReporting: 'applied',
    });
  });

  it('contains synchronous native adapter failures', async () => {
    const adapter = makeAdapter();
    adapter.setCrashReportingCollectionEnabled.mockImplementationOnce(() => {
      throw new Error('native module missing');
    });
    const control = createTelemetryCollectionControl(adapter);

    await expect(control.applyConsent({analytics: true, crashReporting: true})).resolves.toEqual(
      expect.objectContaining({
        effective: {analytics: true, crashReporting: false},
        analytics: 'applied',
        crashReporting: 'failed',
      }),
    );
  });

  it('blocks collection while a preference update is pending', async () => {
    let finishAnalytics: (() => void) | undefined;
    const adapter = makeAdapter();
    adapter.setAnalyticsCollectionEnabled.mockImplementationOnce(() => new Promise<void>(resolve => {
      finishAnalytics = resolve;
    }));
    const control = createTelemetryCollectionControl(adapter, {analytics: true, crashReporting: true});

    const update = control.applyConsent({analytics: true, crashReporting: false});
    expect(control.readConsent()).toEqual({analytics: false, crashReporting: false});
    await Promise.resolve();
    finishAnalytics?.();
    await update;
    expect(control.readConsent()).toEqual({analytics: true, crashReporting: false});
  });
});
