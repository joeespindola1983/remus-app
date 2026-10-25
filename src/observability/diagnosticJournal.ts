import type {
  NitroSQLiteConnection,
  QueryResultRow,
  SQLiteValue,
} from 'react-native-nitro-sqlite';

export type DiagnosticJournalEvent =
  | Readonly<{name: 'app_started'}>
  | Readonly<{
      name: 'collection_consent_applied';
      analytics: boolean;
      crashReporting: boolean;
      outcome: 'applied' | 'partial_failure';
    }>
  | Readonly<{
      name: 'qa_probe_completed';
      channel: 'analytics' | 'crash_reporting';
      outcome: 'accepted' | 'blocked';
    }>;

export type DiagnosticJournalEntry = Readonly<{
  schemaVersion: 1;
  id: string;
  recordedAt: string;
  event: DiagnosticJournalEvent;
}>;

export type DiagnosticJournalDatabase = Pick<
  NitroSQLiteConnection,
  'executeAsync' | 'executeBatchAsync' | 'transaction'
>;

type DiagnosticJournalOptions = Readonly<{
  now?: () => string;
  createId?: () => string;
  maxEntries?: number;
  maxStoredBytes?: number;
}>;

type StoredRow = QueryResultRow & {
  entry_id: string;
  recorded_at: string;
  event_name: string;
  payload_json: string;
  schema_version: number;
};

const defaultMaxEntries = 200;
const defaultMaxStoredBytes = 64 * 1024;
const currentSchemaVersion = 1;

const migrationCommands = [
  {
    query: `CREATE TABLE IF NOT EXISTS remus_schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    )`,
  },
  {
    query: `CREATE TABLE IF NOT EXISTS diagnostic_journal (
      sequence INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id TEXT NOT NULL UNIQUE,
      recorded_at TEXT NOT NULL,
      event_name TEXT NOT NULL CHECK (event_name IN (
        'app_started',
        'collection_consent_applied',
        'qa_probe_completed'
      )),
      payload_json TEXT NOT NULL,
      schema_version INTEGER NOT NULL CHECK (schema_version = 1)
    )`,
  },
  {
    query: `CREATE INDEX IF NOT EXISTS diagnostic_journal_recorded_at
      ON diagnostic_journal(recorded_at, sequence)`,
  },
  {
    query: `INSERT OR IGNORE INTO remus_schema_migrations(version, applied_at)
      VALUES (1, ?)`,
    params: [] as SQLiteValue[],
  },
];

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function parseEvent(name: string, payloadJson: string): DiagnosticJournalEvent | undefined {
  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return undefined;
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {return undefined;}
  const fields = payload as Record<string, unknown>;
  if (name === 'app_started' && exactKeys(fields, [])) {
    return {name};
  }
  if (name === 'collection_consent_applied' &&
      exactKeys(fields, ['analytics', 'crashReporting', 'outcome']) &&
      typeof fields.analytics === 'boolean' && typeof fields.crashReporting === 'boolean' &&
      (fields.outcome === 'applied' || fields.outcome === 'partial_failure')) {
    return {name, analytics: fields.analytics, crashReporting: fields.crashReporting, outcome: fields.outcome};
  }
  if (name === 'qa_probe_completed' && exactKeys(fields, ['channel', 'outcome']) &&
      (fields.channel === 'analytics' || fields.channel === 'crash_reporting') &&
      (fields.outcome === 'accepted' || fields.outcome === 'blocked')) {
    return {name, channel: fields.channel, outcome: fields.outcome};
  }
  return undefined;
}

function serializeEvent(event: DiagnosticJournalEvent): {name: string; payload: string} {
  const {name, ...payload} = event;
  return {name, payload: JSON.stringify(payload)};
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {throw new Error(`${label} must be a positive integer`);}
  return value;
}

const readNumber = (value: SQLiteValue, fallback = 0) => typeof value === 'number' ? value : fallback;

export function createDiagnosticJournal(database: DiagnosticJournalDatabase, options: DiagnosticJournalOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  const createId = options.createId ?? (() =>
    `journal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const maxEntries = positiveInteger(options.maxEntries ?? defaultMaxEntries, 'maxEntries');
  const maxStoredBytes = positiveInteger(options.maxStoredBytes ?? defaultMaxStoredBytes, 'maxStoredBytes');
  let initialization: Promise<void> | undefined;

  const initialize = () => {
    if (!initialization) {
      const commands = migrationCommands.map(command => command.params
        ? {...command, params: [now()]}
        : command);
      initialization = database.executeBatchAsync(commands).then(() => undefined).catch(error => {
        initialization = undefined;
        throw error;
      });
    }
    return initialization;
  };

  const read = async (): Promise<DiagnosticJournalEntry[]> => {
    await initialize();
    const result = await database.executeAsync<StoredRow>(
      `SELECT entry_id, recorded_at, event_name, payload_json, schema_version
       FROM diagnostic_journal ORDER BY sequence ASC`,
    );
    return result.rows._array.flatMap(row => {
      const event = parseEvent(row.event_name, row.payload_json);
      if (!event || row.schema_version !== currentSchemaVersion) {return [];}
      return [{
        schemaVersion: 1 as const,
        id: row.entry_id,
        recordedAt: row.recorded_at,
        event,
      }];
    });
  };

  return {
    initialize,
    async append(event: DiagnosticJournalEvent): Promise<DiagnosticJournalEntry> {
      await initialize();
      const entry: DiagnosticJournalEntry = {
        schemaVersion: 1,
        id: createId(),
        recordedAt: now(),
        event,
      };
      const serialized = serializeEvent(event);
      await database.transaction(async transaction => {
        await transaction.executeAsync(
          `INSERT INTO diagnostic_journal
            (entry_id, recorded_at, event_name, payload_json, schema_version)
           VALUES (?, ?, ?, ?, 1)`,
          [entry.id, entry.recordedAt, serialized.name, serialized.payload],
        );
        await transaction.executeAsync(
          `DELETE FROM diagnostic_journal WHERE sequence IN (
             SELECT sequence FROM diagnostic_journal
             ORDER BY sequence DESC LIMIT -1 OFFSET ?
           )`,
          [maxEntries],
        );
        let storedBytes = readNumber((await transaction.executeAsync<{stored_bytes: number}>(
          `SELECT COALESCE(SUM(
             length(CAST(entry_id AS BLOB)) +
             length(CAST(recorded_at AS BLOB)) +
             length(CAST(event_name AS BLOB)) +
             length(CAST(payload_json AS BLOB)) + 16
           ), 0) AS stored_bytes FROM diagnostic_journal`,
        )).rows.item(0)?.stored_bytes);
        while (storedBytes > maxStoredBytes) {
          await transaction.executeAsync(
            `DELETE FROM diagnostic_journal WHERE sequence = (
               SELECT sequence FROM diagnostic_journal ORDER BY sequence ASC LIMIT 1
             )`,
          );
          storedBytes = readNumber((await transaction.executeAsync<{stored_bytes: number}>(
            `SELECT COALESCE(SUM(
               length(CAST(entry_id AS BLOB)) +
               length(CAST(recorded_at AS BLOB)) +
               length(CAST(event_name AS BLOB)) +
               length(CAST(payload_json AS BLOB)) + 16
             ), 0) AS stored_bytes FROM diagnostic_journal`,
          )).rows.item(0)?.stored_bytes);
        }
      });
      return entry;
    },
    read,
    async exportJson(): Promise<string> {
      return JSON.stringify({schemaVersion: currentSchemaVersion, entries: await read()});
    },
    async clear(): Promise<void> {
      await initialize();
      await database.executeAsync('DELETE FROM diagnostic_journal');
    },
  };
}

export type DiagnosticJournal = ReturnType<typeof createDiagnosticJournal>;
