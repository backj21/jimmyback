# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static personal portfolio website for Jimmy Back (CS undergraduate at UIUC). No build system, bundler, or package manager — just plain HTML, CSS, and JavaScript served directly in the browser.

## Development

Open `index.html` in a browser directly, or use any static file server:

```bash
# Python
python3 -m http.server 8080

# Node (if available)
npx serve .
```

There are no build steps, no tests, and no linting configuration.

## Architecture

Main files at root, blog pages in `blog/`:

- **`index.html`** — Single-page portfolio. Sections in order: Navbar, Hero, About (// 01), Skills (// 02), Projects (// 03), Blog (// 04), Experience (// 05), Contact (// 06), Footer. Uses Tailwind CSS via CDN with a custom font config.
- **`style.css`** — All custom styles layered on top of Tailwind. Shared by both root and `blog/` pages (blog pages reference it as `../style.css`). Defines CSS variables, all component classes, and animations.
- **`script.js`** — Vanilla JS for: navbar frosted-glass transition on scroll, mobile menu toggle, scroll-triggered `.reveal` animations via `IntersectionObserver`, and active nav link highlighting.
- **`blog/index.html`** — Blog listing page with category filter tabs. To add a post: copy a `.blog-card` block, update `data-category`, and create the corresponding `.html` file.

## Design System

- **Fonts**: Instrument Serif (display/headings), Outfit (body), JetBrains Mono (labels, tags, dates)
- **Colors**: `--bg: #FAFAF5` (warm cream), `--bg-white: #FFFFFF`, `--accent: #E8541E` (coral-orange), `--border: #E8E2D9`
- **Section pattern**: every section has a `.section-eyebrow` (`// 01 — Label`) in monospace + a `.section-heading` in Instrument Serif
- **Scroll animations**: add class `reveal` to any element — JS adds `visible` when it enters the viewport with staggered delay based on sibling index
- **Project cards**: have a `::before` pseudo-element that slides in an accent gradient bar on hover

## Content Placeholders

- Project cards: title, description, tech tags, GitHub/demo links in `#projects`
- Experience rows: research/internship entries in `#experience`
- GitHub username: in `#projects` "All on GitHub" link and `#contact`
- Email: `mailto:` href in `#contact`
- LinkedIn URL: in `#contact`
- Blog post files: `blog/post-1.html`, `blog/post-2.html`, `blog/post-3.html` need to be created
