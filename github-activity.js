/* Render the cached calendar; authentication and API requests stay in Actions. */
(async function () {
  const total = document.getElementById('github-total');
  if (!total) return;
  const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
  const locale = () => window.PortfolioLanguage?.locale() || 'en-US';
  const text = (key, values) => window.PortfolioLanguage.text(key, values);
  let snapshot;
  let failed = false;
  const dateLabel = value => new Date(value + 'T00:00:00Z').toLocaleDateString(locale(), {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
  function render() {
    if (!snapshot) {
      total.textContent = text(failed ? 'unavailable' : 'loading');
      return;
    }
    const data = snapshot;
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
        label.textContent = new Date(firstDay.date + 'T00:00:00Z').toLocaleDateString(locale(), { month: 'short', timeZone: 'UTC' });
        cells.append(label);
        previousMonth = month;
      }
      week.contributionDays.forEach(day => {
        const cell = document.createElement('span');
        cell.className = 'contribution-day';
        cell.dataset.level = String(Math.max(0, levels.indexOf(day.contributionLevel)));
        cell.style.gridColumn = column + 1;
        cell.style.gridRow = day.weekday + 2;
        cell.title = text('day', { date: dateLabel(day.date), count: day.contributionCount });
        cells.append(cell);
        days.push(day);
      });
    });
    const count = data.totalContributions.toLocaleString(locale());
    calendar.setAttribute('aria-label', text('calendar', { count }));
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
    total.textContent = text('total', { count });
    const stale = Date.now() - Date.parse(data.updatedAt) > 3 * 86400000;
    document.getElementById('github-updated').textContent = text('updated', { date: dateLabel(data.updatedAt.slice(0, 10)) }) + (stale ? text('pending') : '');
    document.getElementById('github-calendar-content').hidden = false;
  }
  document.addEventListener('languagechange', render);
  render();
  try {
    const response = await fetch('data/github-activity.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Contribution data unavailable');
    const data = await response.json();
    if (!Number.isInteger(data.totalContributions) || !data.weeks?.length) throw new Error('Invalid calendar');
    snapshot = data;
    render();
  } catch {
    snapshot = null;
    failed = true;
    document.getElementById('github-calendar-content').hidden = true;
    render();
  }
})();
