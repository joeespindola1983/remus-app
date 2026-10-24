import {
  createTelemetry,
  type TelemetryCollectionConsent,
  type TelemetrySink,
} from '../src/observability/telemetry';
import {
  createInMemoryTelemetrySink,
  noOpTelemetrySink,
} from '../src/observability/telemetrySinks';

describe('Remus telemetry', () => {
  const makeSink = () => ({
    logEvent: jest.fn<ReturnType<TelemetrySink['logEvent']>, Parameters<TelemetrySink['logEvent']>>(),
    recordError: jest.fn<ReturnType<TelemetrySink['recordError']>, Parameters<TelemetrySink['recordError']>>(),
  });

  it('sends a stable app startup event exactly once per call', async () => {
    const sink = makeSink();
    await expect(createTelemetry(sink).trackAppStarted()).resolves.toBe(true);
    expect(sink.logEvent).toHaveBeenCalledTimes(1);
    expect(sink.logEvent).toHaveBeenCalledWith({name: 'remus_app_started'});
    expect(sink.recordError).not.toHaveBeenCalled();
  });

  it('fails closed when Analytics consent is disabled', async () => {
    const sink = makeSink();
    const consent: TelemetryCollectionConsent = {analytics: false, crashReporting: true};
    await expect(createTelemetry(sink, () => consent).trackAppStarted()).resolves.toBe(false);
    expect(sink.logEvent).not.toHaveBeenCalled();
  });

  it('reads current consent for every operation', async () => {
    const sink = makeSink();
    let consent: TelemetryCollectionConsent = {analytics: false, crashReporting: false};
    const telemetry = createTelemetry(sink, () => consent);

    await expect(telemetry.trackAppStarted()).resolves.toBe(false);
    consent = {analytics: true, crashReporting: true};
    await expect(telemetry.trackAppStarted()).resolves.toBe(true);
    expect(sink.logEvent).toHaveBeenCalledTimes(1);
  });

  it('does not interrupt the app if Analytics fails', async () => {
    const sink = makeSink();
    sink.logEvent.mockRejectedValueOnce(new Error('offline'));
    await expect(createTelemetry(sink).trackAppStarted()).resolves.toBe(false);
    expect(sink.recordError).not.toHaveBeenCalled();
  });

  it('preserves Error objects passed to Crashlytics', async () => {
    const sink = makeSink();
    const error = new Error('recoverable');
    await expect(createTelemetry(sink).recordNonFatal(error)).resolves.toBe(true);
    expect(sink.recordError).toHaveBeenCalledWith(error);
  });

  it('does not report recoverable errors without crash-reporting consent', async () => {
    const sink = makeSink();
    const consent: TelemetryCollectionConsent = {analytics: true, crashReporting: false};
    await expect(createTelemetry(sink, () => consent).recordNonFatal(new Error('offline')))
      .resolves.toBe(false);
    expect(sink.recordError).not.toHaveBeenCalled();
  });

  it('converts non-Error values and swallows reporting failures', async () => {
    const sink = makeSink();
    sink.recordError.mockRejectedValueOnce(new Error('native unavailable'));
    await expect(createTelemetry(sink).recordNonFatal('GPS unavailable')).resolves.toBe(false);
    expect(sink.recordError).toHaveBeenCalledWith(
      expect.objectContaining({message: 'GPS unavailable'}),
    );
  });

  it('fails closed if reading consent fails', async () => {
    const sink = makeSink();
    const telemetry = createTelemetry(sink, () => {
      throw new Error('preferences unavailable');
    });
    await expect(telemetry.trackAppStarted()).resolves.toBe(false);
    await expect(telemetry.recordNonFatal(new Error('recoverable'))).resolves.toBe(false);
    expect(sink.logEvent).not.toHaveBeenCalled();
    expect(sink.recordError).not.toHaveBeenCalled();
  });

  it('provides no-op and inspectable in-memory adapters without an SDK', async () => {
    const memory = createInMemoryTelemetrySink();
    const telemetry = createTelemetry(memory);
    await expect(telemetry.trackAppStarted()).resolves.toBe(true);
    await expect(telemetry.recordNonFatal(new Error('recoverable'))).resolves.toBe(true);
    expect(memory.events).toEqual([{name: 'remus_app_started'}]);
    expect(memory.errors).toEqual([expect.objectContaining({message: 'recoverable'})]);

    await expect(createTelemetry(noOpTelemetrySink).trackAppStarted()).resolves.toBe(true);
  });
});
