import { writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

export function calendarSnapshot(response, updatedAt = new Date().toISOString()) {
  if (response.errors?.length) throw new Error('GitHub returned GraphQL errors');
  const calendar = response.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || !Number.isInteger(calendar.totalContributions) || !calendar.weeks?.length) {
    throw new Error('Invalid GitHub calendar');
  }
  let total = 0;
  const dates = new Set();
  const weeks = calendar.weeks.map(week => ({
    contributionDays: week.contributionDays.map(day => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || dates.has(day.date) ||
          !Number.isInteger(day.weekday) || day.weekday < 0 || day.weekday > 6 ||
          new Date(`${day.date}T00:00:00Z`).getUTCDay() !== day.weekday ||
          !Number.isInteger(day.contributionCount) || day.contributionCount < 0 ||
          !levels.includes(day.contributionLevel)) throw new Error('Invalid contribution day');
      dates.add(day.date);
      total += day.contributionCount;
      return { date: day.date, weekday: day.weekday, contributionCount: day.contributionCount,
        contributionLevel: day.contributionLevel };
    })
  }));
  if (total !== calendar.totalContributions) throw new Error('Inconsistent contribution total');
  return { username: 'backj21', updatedAt, totalContributions: total, weeks };
}

async function refresh() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error('Set GH_TOKEN or GITHUB_TOKEN to refresh contribution data');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ query: `query {
      user(login: "backj21") { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date weekday contributionCount contributionLevel } }
      } } }
    }` })
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status})`);
  const snapshot = calendarSnapshot(await response.json());
  const destination = new URL('../data/github-activity.json', import.meta.url);
  const temporary = new URL('../data/github-activity.json.tmp', import.meta.url);
  await writeFile(temporary, JSON.stringify(snapshot) + '\n');
  await rename(temporary, destination);
  console.log(`Saved ${snapshot.totalContributions} contributions across ${snapshot.weeks.length} weeks`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  refresh().catch(error => { console.error(error.message); process.exitCode = 1; });
}
