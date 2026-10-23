import {createTelemetry, type TelemetrySink} from '../src/observability/telemetry';

describe('Remus telemetry', () => {
  const makeSink = () => ({
    logEvent: jest.fn<ReturnType<TelemetrySink['logEvent']>, Parameters<TelemetrySink['logEvent']>>(),
    recordError: jest.fn<ReturnType<TelemetrySink['recordError']>, Parameters<TelemetrySink['recordError']>>(),
  });

  it('sends a stable app startup event exactly once per call', async () => {
    const sink = makeSink();
    await expect(createTelemetry(sink).trackAppStarted()).resolves.toBe(true);
    expect(sink.logEvent).toHaveBeenCalledTimes(1);
    expect(sink.logEvent).toHaveBeenCalledWith('remus_app_started');
    expect(sink.recordError).not.toHaveBeenCalled();
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

  it('converts non-Error values and swallows reporting failures', async () => {
    const sink = makeSink();
    sink.recordError.mockRejectedValueOnce(new Error('native unavailable'));
    await expect(createTelemetry(sink).recordNonFatal('GPS unavailable')).resolves.toBe(false);
    expect(sink.recordError).toHaveBeenCalledWith(
      expect.objectContaining({message: 'GPS unavailable'}),
    );
  });
});
