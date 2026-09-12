import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarSnapshot } from '../scripts/refresh-github-activity.mjs';

const response = () => ({ data: { user: { contributionsCollection: { contributionCalendar: {
  totalContributions: 3,
  weeks: [{ contributionDays: [
    { date: '2026-09-10', weekday: 4, contributionCount: 0, contributionLevel: 'NONE' },
    { date: '2026-09-11', weekday: 5, contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' }
  ] }]
} } } } });

test('preserves daily positions and counts in partial calendar weeks', () => {
  const result = calendarSnapshot(response(), '2026-09-12T12:00:00Z');
  assert.equal(result.totalContributions, 3);
  assert.equal(result.weeks[0].contributionDays[0].weekday, 4);
  assert.equal(result.weeks[0].contributionDays[1].contributionCount, 3);
  assert.equal(result.updatedAt, '2026-09-12T12:00:00Z');
});

test('rejects API errors instead of replacing the last good snapshot', () => {
  assert.throws(() => calendarSnapshot({ errors: [{ message: 'rate limited' }] }), /GitHub/);
});

test('rejects malformed daily data and inconsistent totals', () => {
  const invalid = response();
  invalid.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[1].contributionCount = -1;
  assert.throws(() => calendarSnapshot(invalid), /Invalid/);
  const mismatch = response();
  mismatch.data.user.contributionsCollection.contributionCalendar.totalContributions = 9;
  assert.throws(() => calendarSnapshot(mismatch), /total/);
});

test('rejects duplicate dates and invalid weekday alignment', () => {
  const duplicate = response();
  const days = duplicate.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays;
  days.push({ ...days[0] });
  assert.throws(() => calendarSnapshot(duplicate), /Invalid/);
  const misaligned = response();
  misaligned.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0].weekday = 0;
  assert.throws(() => calendarSnapshot(misaligned), /Invalid/);
});
