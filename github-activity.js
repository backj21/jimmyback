/* Render the cached calendar; authentication and API requests stay in Actions. */
(async function () {
  const total = document.getElementById('github-total');
  if (!total) return;
  const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
  const dateLabel = value => new Date(value + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
  try {
    const response = await fetch('data/github-activity.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Contribution data unavailable');
    const data = await response.json();
    if (!Number.isInteger(data.totalContributions) || !data.weeks?.length) throw new Error('Invalid calendar');
    const calendar = document.getElementById('github-calendar');
    calendar.style.gridTemplateColumns = `repeat(${data.weeks.length}, minmax(11px, 1fr))`;
    const cells = document.createDocumentFragment();
    const days = [];
    let previousMonth = '';
    data.weeks.forEach((week, column) => {
      const firstDay = week.contributionDays[0];
      const month = firstDay.date.slice(0, 7);
      if (month !== previousMonth && column < data.weeks.length - 2) {
        const label = document.createElement('span');
        label.className = 'calendar-month';
        label.style.gridColumn = `${column + 1} / span 3`;
        label.textContent = new Date(firstDay.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        cells.append(label);
        previousMonth = month;
      }
      week.contributionDays.forEach(day => {
        const cell = document.createElement('span');
        cell.className = 'contribution-day';
        cell.dataset.level = String(Math.max(0, levels.indexOf(day.contributionLevel)));
        cell.style.gridColumn = column + 1;
        cell.style.gridRow = day.weekday + 2;
        cell.title = `${dateLabel(day.date)}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}`;
        cells.append(cell);
        days.push(day);
      });
    });
    const count = data.totalContributions.toLocaleString('en-US');
    calendar.setAttribute('aria-label', `${count} GitHub contributions in the last year. Daily counts are available below.`);
    calendar.replaceChildren(cells);
    const rows = document.createDocumentFragment();
    [...days].reverse().forEach(day => {
      const row = document.createElement('tr');
      const date = document.createElement('td');
      date.textContent = dateLabel(day.date);
      const countCell = document.createElement('td');
      countCell.textContent = day.contributionCount;
      row.append(date, countCell);
      rows.append(row);
    });
    document.getElementById('github-daily-counts').replaceChildren(rows);
    total.textContent = `${count} contributions in the last year`;
    const stale = Date.now() - Date.parse(data.updatedAt) > 3 * 86400000;
    document.getElementById('github-updated').textContent = `Updated ${dateLabel(data.updatedAt.slice(0, 10))}${stale ? ' · Refresh pending' : ''}`;
    document.getElementById('github-calendar-content').hidden = false;
  } catch {
    total.textContent = 'Contribution activity is temporarily unavailable. View it on GitHub.';
  }
})();
