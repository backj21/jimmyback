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
