// Korean copy is authored in data-ko attributes; English remains the HTML default.
(function () {
  const elements = [...document.querySelectorAll('[data-ko]')].map(element => ({
    element, en: element.innerHTML, ko: element.dataset.ko
  }));
  const attributes = ['aria-label', 'content'].flatMap(attribute =>
    [...document.querySelectorAll(`[data-ko-${attribute}]`)].map(element => ({
      element, attribute, en: element.getAttribute(attribute), ko: element.getAttribute(`data-ko-${attribute}`)
    }))
  );
  const messages = {
    en: {
      loading: 'Loading contribution activity…', unavailable: 'Contribution activity is temporarily unavailable. View it on GitHub.',
      total: '{count} contributions in the last year', calendar: '{count} GitHub contributions in the last year. Daily counts are available below.',
      updated: 'Updated {date}', pending: ' · Refresh pending', day: '{date}: {count} contributions',
      light: 'Switch to light mode', dark: 'Switch to dark mode', lightLabel: 'Light', darkLabel: 'Dark'
    },
    ko: {
      loading: 'GitHub 활동을 불러오는 중…', unavailable: '활동 정보를 불러올 수 없습니다. GitHub에서 확인해 주세요.',
      total: '최근 1년간 기여 {count}회', calendar: '최근 1년간 GitHub 기여 {count}회. 아래에서 일별 기여 수를 확인할 수 있습니다.',
      updated: '업데이트: {date}', pending: ' · 갱신 대기 중', day: '{date}: 기여 {count}회',
      light: '라이트 모드로 전환', dark: '다크 모드로 전환', lightLabel: '라이트', darkLabel: '다크'
    }
  };
  let language = 'en';
  function text(key, values = {}) {
    return (messages[language][key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  }
  function setLanguage(next, updateURL = true) {
    language = next === 'ko' ? 'ko' : 'en';
    document.documentElement.lang = language;
    elements.forEach(({ element, en, ko }) => { element.innerHTML = language === 'ko' ? ko : en; });
    attributes.forEach(({ element, attribute, en, ko }) => element.setAttribute(attribute, language === 'ko' ? ko : en));
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    try { localStorage.setItem('language', language); } catch {}
    if (updateURL) {
      try {
        const url = new URL(location.href);
        url.searchParams.set('lang', language);
        history.replaceState(null, '', url);
      } catch {}
    }
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }
  window.PortfolioLanguage = { setLanguage, text, getLanguage: () => language, locale: () => language === 'ko' ? 'ko-KR' : 'en-US' };
  let initial = 'en';
  try { initial = localStorage.getItem('language') || 'en'; } catch {}
  const query = new URLSearchParams(location.search).get('lang');
  if (query === 'en' || query === 'ko') initial = query;
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  setLanguage(initial, false);
})();
