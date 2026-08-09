# Public Poetry Notes

An iOS Notes-inspired public poetry site. Poems are Markdown files in `poems/`; visitors do not sign in to read them.

## Add a poem

1. Add a `.md` file under `poems/`.
2. Use this front matter:

```md
---
title: Your Poem Title
date: 2026-08-09
---

Your poem...
```

3. Add the filename to `poems/index.json`.
4. Commit and push. GitHub Pages will publish it.

## Comments

Comments use Giscus. Readers can read without signing in. To comment, they authenticate through GitHub because Giscus stores comments in GitHub Discussions.

After creating a Giscus configuration for the repository, put its `repo`, `repo-id`, `category`, and `category-id` values in `app.js`.
