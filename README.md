# Jimmy Back's Portfolio
Personal website to track and record my projects.

## Homepage updates

Edit the `currently-list` entries in `index.html` to update current projects, status,
and optional links. Each list item uses
`currently-item`, a `currently-dot` span, and a `currently-status` span.
Update the adjacent `<time>` when the project information changes.

GitHub activity is rendered from `data/github-activity.json`. The
**Refresh GitHub activity** workflow updates it daily at 12:23 UTC and requests a
GitHub Pages rebuild. It can also be run manually from the Actions tab. Only
aggregate dates and counts are stored; browser code never receives a token.
The workflow uses its built-in token, so no personal access token is required.
GitHub's API visibility rules can cause these counts to differ from your profile's
private-contribution totals. The date beneath the calendar shows snapshot freshness.

To refresh locally with an authenticated GitHub CLI:

```sh
GH_TOKEN="$(gh auth token)" node scripts/refresh-github-activity.mjs
```

Run data checks with `node --test tests/*.test.mjs`. Serve the repository with
`python3 -m http.server 8080`; contribution data requires HTTP, not a `file:` URL.

## Languages

The EN/KR control switches between English and Korean and saves the choice in
local storage. Share `?lang=ko` or `?lang=en` to open a specific language;
the query parameter overrides the saved preference. English is the default.
The HTML language tag uses the standard `ko` code; the button displays `KR`.

English copy lives in the HTML. Add the equivalent Korean copy in `data-ko`
on the same element. Use `data-ko-aria-label` for accessible labels and
`data-ko-content` for metadata. Keep translated elements unnested so switching
languages preserves their DOM references. Dynamic calendar and theme messages
live in `language.js`. Update both languages when changing homepage or blog copy.

There is still no production build step. Development tests use jsdom:
`npm ci --ignore-scripts` followed by `npm test`.
