import {open} from 'react-native-nitro-sqlite';
import {createDiagnosticJournal} from './diagnosticJournal';

const remusDatabase = open({name: 'remus.sqlite'});

/** Shared low-frequency technical journal. Recording samples never belong here. */
export const remusDiagnosticJournal = createDiagnosticJournal(remusDatabase);
