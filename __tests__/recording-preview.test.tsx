import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {RecordingPreview} from '../src/recording/dev/RecordingPreview';
import {PhoneRecordingAdapter} from '../src/recording/phoneRecordingAdapter';
import {iosSyntheticFixtures} from '../src/recording/fixtures/phoneRecordingFixtures';

describe('Recording QA preview', () => {
  const createMockBridge = () => ({
    startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
    stopRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.finalizedManifest),
    getRecordingState: jest.fn().mockResolvedValue(iosSyntheticFixtures.idleState),
    exportRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.exportResult),
    getLocationPermissionStatus: jest.fn().mockResolvedValue('granted'),
    requestLocationPermission: jest.fn().mockResolvedValue('granted'),
    getBatteryLevel: jest.fn().mockResolvedValue(95),
    getPhoneHardwareProfile: jest.fn().mockResolvedValue({
      hasGps: true,
      hasAccelerometer: true,
      hasGyroscope: true,
    }),
  });

  it('renders initial idle state, battery and hardware profile', async () => {
    const bridge = createMockBridge();
    const adapter = new PhoneRecordingAdapter(bridge);
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<RecordingPreview mode="athleteLight" adapter={adapter} />);
      await Promise.resolve();
    });

    const statusText = renderer?.root.findByProps({testID: 'recording-status'}).props.children;
    expect(statusText).toBe('Pronto');

    const permissionText = renderer?.root.findByProps({testID: 'recording-permission-status'}).props.children;
    expect(permissionText).toContain('Concedida');

    await ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('starts and stops recording through preview controls', async () => {
    const bridge = createMockBridge();
    const adapter = new PhoneRecordingAdapter(bridge);
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<RecordingPreview mode="athleteLight" adapter={adapter} />);
      await Promise.resolve();
    });

    // Start recording
    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'recording-start-button'}).props.onPress();
      await Promise.resolve();
    });

    expect(bridge.startRecording).toHaveBeenCalled();
    expect(renderer?.root.findByProps({testID: 'recording-status'}).props.children).toBe('Gravando');

    // Stop recording
    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'recording-stop-button'}).props.onPress();
      await Promise.resolve();
    });

    expect(bridge.stopRecording).toHaveBeenCalled();
    expect(renderer?.root.findByProps({testID: 'recording-status'}).props.children).toBe('Pronto');

    await ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('exports recording and displays zip path', async () => {
    const bridge = createMockBridge();
    const adapter = new PhoneRecordingAdapter(bridge);
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<RecordingPreview mode="athleteLight" adapter={adapter} />);
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      renderer?.root.findByProps({testID: 'recording-export-button'}).props.onPress();
      await Promise.resolve();
    });

    expect(bridge.exportRecording).toHaveBeenCalled();
    const resultText = renderer?.root.findByProps({testID: 'recording-last-result'}).props.children;
    expect(resultText).toContain('activity-ios-001.zip');

    await ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('does not show active recording when permission is denied', async () => {
    const bridge = createMockBridge();
    bridge.getLocationPermissionStatus.mockResolvedValue('denied');
    const adapter = new PhoneRecordingAdapter(bridge);
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<RecordingPreview mode="athleteLight" adapter={adapter} />);
      await Promise.resolve();
    });

    const permissionText = renderer?.root.findByProps({testID: 'recording-permission-status'}).props.children;
    expect(permissionText).toContain('Negada');
    expect(renderer?.root.findByProps({testID: 'recording-status'}).props.children).toBe('Pronto');

    await ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});
