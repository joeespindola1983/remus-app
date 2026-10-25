/** QA-ONLY adapter: reproduces approved Golden Master summary cards from the
 * frozen sample. This file must NOT be imported by production chart components.
 * In the product, local C++ engine, imported analysis artifact or backend supplies
 * ChartContextSummary. Never move these calculations to /molecules.
 */
import {
  type ChartContextSummary, type ChartSelection, type ChartSession,
} from '../molecules/chartContract';

export function goldenChartSummaryFixture(
  session: ChartSession, selection: ChartSelection,
): ChartContextSummary {
  const rows = session.data.filter(row => row.t >= selection.start && row.t <= selection.end);
  const distanceMeters = rows.length >= 2 ? Math.max(0, rows[rows.length - 1].d - rows[0].d) : 0;
  const durationSeconds = Math.max(0, selection.end - selection.start);
  const spms = rows.map(row => row.spm).filter((n): n is number => n !== null && Number.isFinite(n) && n > 0);
  return {
    range: {start: selection.start, end: selection.end},
    averageSpm: spms.length ? spms.reduce((acc, n) => acc + n, 0) / spms.length : null,
    averageSplitSecondsPer500m: distanceMeters > 5 ? durationSeconds * 500 / distanceMeters : null,
    distanceMeters,
    durationSeconds,
  };
}
