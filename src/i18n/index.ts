export type Locale = 'pt-BR' | 'en-US';

export const translations = {
  'pt-BR': {
    'recording.title': 'Gravação no Celular',
    'recording.start': 'Iniciar Gravação',
    'recording.stop': 'Parar Gravação',
    'recording.export': 'Exportar Gravação',
    'recording.reconcile': 'Reconciliar Estado',
    'recording.status.recording': 'Gravando',
    'recording.status.idle': 'Pronto',
    'recording.status.interrupted': 'Interrompido',
    'recording.status.unknown': 'Estado Indeterminado',
    'recording.permission.title': 'Permissão de Localização',
    'recording.permission.request': 'Solicitar Permissão',
    'recording.permission.granted': 'Concedida',
    'recording.permission.denied': 'Negada',
    'recording.permission.undetermined': 'Não Determinada',
    'recording.sampleCount': '{count} amostras',
    'recording.motionSamples': 'Amostras de Movimento: {count}',
    'recording.locationSamples': 'Amostras de GPS: {count}',
    'recording.distance': 'Distância: {distance} m',
    'recording.speed': 'Velocidade: {speed} m/s',
    'recording.accuracy': 'Precisão GPS: {accuracy} m',
    'recording.battery': 'Bateria: {level}%',
    'recording.hardware.gps': 'GPS',
    'recording.hardware.accelerometer': 'Acelerômetro',
    'recording.hardware.gyroscope': 'Giroscópio',
    'recording.hardware.barometer': 'Barômetro',
    'recording.activityId': 'ID da Atividade: {id}',
    'recording.exportSuccess': 'Arquivo ZIP exportado: {path}',
    'recording.error': 'Erro: {message}',
  },
  'en-US': {
    'recording.title': 'Phone Recording',
    'recording.start': 'Start Recording',
    'recording.stop': 'Stop Recording',
    'recording.export': 'Export Recording',
    'recording.reconcile': 'Reconcile State',
    'recording.status.recording': 'Recording',
    'recording.status.idle': 'Ready',
    'recording.status.interrupted': 'Interrupted',
    'recording.status.unknown': 'Indeterminate State',
    'recording.permission.title': 'Location Permission',
    'recording.permission.request': 'Request Permission',
    'recording.permission.granted': 'Granted',
    'recording.permission.denied': 'Denied',
    'recording.permission.undetermined': 'Undetermined',
    'recording.sampleCount': '{count} samples',
    'recording.motionSamples': 'Motion Samples: {count}',
    'recording.locationSamples': 'GPS Samples: {count}',
    'recording.distance': 'Distance: {distance} m',
    'recording.speed': 'Speed: {speed} m/s',
    'recording.accuracy': 'GPS Accuracy: {accuracy} m',
    'recording.battery': 'Battery: {level}%',
    'recording.hardware.gps': 'GPS',
    'recording.hardware.accelerometer': 'Accelerometer',
    'recording.hardware.gyroscope': 'Gyroscope',
    'recording.hardware.barometer': 'Barometer',
    'recording.activityId': 'Activity ID: {id}',
    'recording.exportSuccess': 'ZIP archive exported: {path}',
    'recording.error': 'Error: {message}',
  },
} as const;

export type TranslationKey = keyof typeof translations['pt-BR'];

let currentLocale: Locale = 'pt-BR';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const dictionary = translations[currentLocale] || translations['pt-BR'];
  let template: string = dictionary[key] || translations['pt-BR'][key] || key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }

  return template;
}
