import {t, getLocale, setLocale, translations} from '../src/i18n';

describe('i18n internationalization catalog', () => {
  beforeEach(() => {
    setLocale('pt-BR');
  });

  it('provides translations in pt-BR by default', () => {
    expect(getLocale()).toBe('pt-BR');
    expect(t('recording.start')).toBe('Iniciar Gravação');
    expect(t('recording.stop')).toBe('Parar Gravação');
    expect(t('recording.status.recording')).toBe('Gravando');
    expect(t('recording.status.idle')).toBe('Pronto');
  });

  it('switches to en-US and returns translated text', () => {
    setLocale('en-US');
    expect(getLocale()).toBe('en-US');
    expect(t('recording.start')).toBe('Start Recording');
    expect(t('recording.stop')).toBe('Stop Recording');
    expect(t('recording.status.recording')).toBe('Recording');
    expect(t('recording.status.idle')).toBe('Ready');
  });

  it('interpolates placeholders with provided parameters', () => {
    expect(t('recording.sampleCount', {count: 42})).toBe('42 amostras');
    setLocale('en-US');
    expect(t('recording.sampleCount', {count: 42})).toBe('42 samples');
  });

  it('falls back to pt-BR or key if translation is missing in chosen locale', () => {
    expect(t('nonexistent.key' as any)).toBe('nonexistent.key');
  });

  it('ensures all keys defined in pt-BR also exist in en-US', () => {
    const ptKeys = Object.keys(translations['pt-BR']);
    const enKeys = Object.keys(translations['en-US']);
    expect(enKeys).toEqual(expect.arrayContaining(ptKeys));
    expect(ptKeys).toEqual(expect.arrayContaining(enKeys));
  });
});
