import {open, resetAllDatabases} from 'react-native-nitro-sqlite/mock';
import {createDiagnosticJournal} from '../src/observability/diagnosticJournal';

const dependencies = {
  now: jest.fn(() => '2026-10-25T12:00:00.000Z'),
  createId: jest.fn(() => 'entry-1'),
};

describe('SQLite diagnostic journal', () => {
  afterEach(() => {
    resetAllDatabases();
    dependencies.now.mockClear();
    dependencies.createId.mockClear();
  });

  const openDatabase = () => open({name: 'diagnostics.sqlite'});

  it('migrates its isolated schema and persists a typed event', async () => {
    const database = openDatabase();
    const journal = createDiagnosticJournal(database, dependencies);

    await journal.append({
      name: 'collection_consent_applied',
      analytics: true,
      crashReporting: false,
      outcome: 'applied',
    });

    await expect(journal.read()).resolves.toEqual([{
      schemaVersion: 1,
      id: 'entry-1',
      recordedAt: '2026-10-25T12:00:00.000Z',
      event: {
        name: 'collection_consent_applied',
        analytics: true,
        crashReporting: false,
        outcome: 'applied',
      },
    }]);
    expect(database.execute<{name: string}>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    ).rows._array.map(row => row.name)).toEqual(expect.arrayContaining([
      'diagnostic_journal',
      'remus_schema_migrations',
    ]));
    database.close();
  });

  it('retains only the newest configured number of entries', async () => {
    const database = openDatabase();
    let id = 0;
    const journal = createDiagnosticJournal(database, {
      ...dependencies,
      createId: () => `entry-${++id}`,
      maxEntries: 2,
    });

    await journal.append({name: 'app_started'});
    await journal.append({name: 'qa_probe_completed', channel: 'analytics', outcome: 'accepted'});
    await journal.append({name: 'qa_probe_completed', channel: 'crash_reporting', outcome: 'blocked'});

    await expect(journal.read()).resolves.toEqual([
      expect.objectContaining({id: 'entry-2'}),
      expect.objectContaining({id: 'entry-3'}),
    ]);
    database.close();
  });

  it('drops oldest entries until the stored diagnostic payload fits its quota', async () => {
    const database = openDatabase();
    let id = 0;
    const journal = createDiagnosticJournal(database, {
      ...dependencies,
      createId: () => `entry-${++id}`,
      maxStoredBytes: 150,
    });

    await journal.append({name: 'app_started'});
    await journal.append({name: 'qa_probe_completed', channel: 'analytics', outcome: 'accepted'});

    await expect(journal.read()).resolves.toEqual([
      expect.objectContaining({id: 'entry-2'}),
    ]);
    database.close();
  });

  it('ignores malformed rows instead of exposing unexpected or sensitive fields', async () => {
    const database = openDatabase();
    const journal = createDiagnosticJournal(database, dependencies);
    await journal.initialize();
    database.execute(
      `INSERT INTO diagnostic_journal
        (entry_id, recorded_at, event_name, payload_json, schema_version)
       VALUES (?, ?, ?, ?, 1)`,
      ['bad-entry', dependencies.now(), 'app_started', JSON.stringify({email: 'x@y.z'})],
    );

    await expect(journal.read()).resolves.toEqual([]);
    await expect(journal.exportJson()).resolves.not.toContain('x@y.z');
    database.close();
  });

  it('serializes concurrent appends through the native SQLite queue', async () => {
    const database = openDatabase();
    let id = 0;
    const journal = createDiagnosticJournal(database, {
      ...dependencies,
      createId: () => `entry-${++id}`,
    });

    await Promise.all([
      journal.append({name: 'app_started'}),
      journal.append({name: 'qa_probe_completed', channel: 'analytics', outcome: 'accepted'}),
      journal.append({name: 'qa_probe_completed', channel: 'crash_reporting', outcome: 'blocked'}),
    ]);

    await expect(journal.read()).resolves.toEqual([
      expect.objectContaining({id: 'entry-1'}),
      expect.objectContaining({id: 'entry-2'}),
      expect.objectContaining({id: 'entry-3'}),
    ]);
    database.close();
  });

  it('clears persisted diagnostics only through the explicit operation', async () => {
    const database = openDatabase();
    const journal = createDiagnosticJournal(database, dependencies);
    await journal.append({name: 'app_started'});

    await journal.clear();

    await expect(journal.read()).resolves.toEqual([]);
    database.close();
  });
});
