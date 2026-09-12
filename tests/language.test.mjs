import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

function page(path = 'index.html', options = {}) {
  const dom = new JSDOM(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), {
    url: 'https://backj21.github.io/jimmyback/' + (options.query || ''), runScripts: 'outside-only'
  });
  if (options.saved) dom.window.localStorage.setItem('language', options.saved);
  if (options.blocked) Object.defineProperty(dom.window, 'localStorage', { get() { throw new Error('blocked'); } });
  dom.window.eval(readFileSync(new URL('../language.js', import.meta.url), 'utf8'));
  return dom;
}

test('switches homepage to Korean and restores exact English content and links', () => {
  const { window } = page();
  const original = window.document.querySelector('#experience').innerHTML;
  const links = [...window.document.querySelectorAll('main a')].map(a => a.href);
  window.document.querySelector('[data-language="ko"]').click();
  assert.equal(window.document.documentElement.lang, 'ko');
  assert.match(window.document.querySelector('.hero-title').textContent, /소프트웨어 엔지니어/);
  assert.match(window.document.querySelector('.currently-copy').textContent, /Sori 개발 중/);
  assert.match(window.document.querySelector('#experience').textContent, /98.5%/);
  assert.equal(window.localStorage.getItem('language'), 'ko');
  assert.equal(window.document.querySelector('[data-language="ko"]').getAttribute('aria-pressed'), 'true');
  assert.deepEqual([...window.document.querySelectorAll('main a')].map(a => a.href), links);
  window.document.querySelector('[data-language="en"]').click();
  assert.equal(window.document.querySelector('#experience').innerHTML, original);
});

test('honors saved preference, URL override and unavailable storage', () => {
  assert.equal(page('index.html', { saved: 'ko' }).window.document.documentElement.lang, 'ko');
  assert.equal(page('index.html', { saved: 'ko', query: '?lang=en' }).window.document.documentElement.lang, 'en');
  const { window } = page('index.html', { blocked: true });
  window.PortfolioLanguage.setLanguage('ko');
  assert.equal(window.document.documentElement.lang, 'ko');
});

test('translates both blog pages and preserves navigation', () => {
  for (const file of ['blog/index.html', 'blog/my-first-hackathon.html']) {
    const { window } = page(file, { saved: 'ko' });
    assert.equal(window.document.documentElement.lang, 'ko');
    assert.match(window.document.querySelector('h1').textContent, /블로그|첫 해커톤/);
    assert(window.document.querySelector('[data-language="en"]'));
  }
});

test('updates loaded contribution counts, dates and failures without refetching', async () => {
  const { window } = page();
  let calls = 0;
  window.AbortSignal = AbortSignal;
  window.fetch = async () => { calls++; return { ok: true, json: async () => JSON.parse(readFileSync(new URL('../data/github-activity.json', import.meta.url), 'utf8')) }; };
  const calendarScript = readFileSync(new URL('../github-activity.js', import.meta.url), 'utf8');
  await window.eval(calendarScript);
  window.PortfolioLanguage.setLanguage('ko');
  assert.match(window.document.querySelector('#github-total').textContent, /최근 1년간 기여/);
  assert.match(window.document.querySelector('#github-updated').textContent, /업데이트/);
  assert.match(window.document.querySelector('.contribution-day').title, /기여/);
  assert.match(window.document.querySelector('#github-daily-counts td').textContent, /년/);
  window.PortfolioLanguage.setLanguage('en');
  assert.match(window.document.querySelector('#github-total').textContent, /contributions in the last year/);
  assert.equal(calls, 1);
  const failed = page().window;
  failed.AbortSignal = AbortSignal;
  failed.fetch = async () => { throw new Error('offline'); };
  await failed.eval(calendarScript);
  failed.PortfolioLanguage.setLanguage('ko');
  assert.match(failed.document.querySelector('#github-total').textContent, /불러올 수 없습니다/);
});

test('theme labels follow language and retain the selected theme', () => {
  const { window } = page();
  window.matchMedia = () => ({ matches: false });
  window.eval(readFileSync(new URL('../theme.js', import.meta.url), 'utf8'));
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  window.document.querySelector('#theme-toggle').click();
  window.PortfolioLanguage.setLanguage('ko');
  assert.equal(window.document.documentElement.dataset.theme, 'dark');
  assert.equal(window.document.querySelector('#theme-toggle').getAttribute('aria-label'), '라이트 모드로 전환');
  window.PortfolioLanguage.setLanguage('en');
  assert.equal(window.document.querySelector('#theme-toggle').getAttribute('aria-label'), 'Switch to light mode');
});
