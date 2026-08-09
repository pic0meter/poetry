# Deployment

## 1. Create the repository

Create a public GitHub repository, e.g. `poems`.
Upload all files in this folder.

## 2. Enable GitHub Pages

Repository → Settings → Pages → Source: **GitHub Actions**.

Use any static Pages workflow, or deploy the repository root with a Pages action. The site is entirely static.

## 3. Configure Giscus comments

Open https://giscus.app/ and select your public repository.

Requirements:
- The repository must be public.
- Discussions must be enabled in the repository.
- Install/enable the Giscus GitHub App when prompted.
- Create/select a Discussions category for comments.

Giscus gives you values like:
- data-repo
- data-repo-id
- data-category
- data-category-id

Open `app.js` and replace:

window.GISCUS_REPO='YOUR_GITHUB_USERNAME/YOUR_REPO';
window.GISCUS_REPO_ID='';
window.GISCUS_CATEGORY='Comments';
window.GISCUS_CATEGORY_ID='';

with the values from Giscus.

## 4. Add poems

Every new poem is just a Markdown file in `poems/`, plus its filename in `poems/index.json`.

Example:

`poems/lavender-light.md`

```md
---
title: Lavender Light
date: 2026-08-09
---

Softly, some songs still speak of you,
Lavender light leaves me longing too;
```

Then add `"lavender-light.md"` to `poems/index.json` and push the commit.
