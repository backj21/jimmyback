// Persisted light/dark theme toggle shared across pages.
(function () {
  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var icon = btn.querySelector('.theme-toggle-icon');
    var label = btn.querySelector('.theme-toggle-label');
    var isDark = theme === 'dark';

    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (icon) icon.textContent = isDark ? '☀' : '🌙';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    setTheme(current);

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      setTheme(next);
    });
  });
})();
