# Deploying the cross-device version

This project has two pieces: the GitHub Pages frontend and a Node backend. The backend is required because a GitHub OAuth secret must never be placed in public GitHub Pages JavaScript.

## 1. GitHub repository
Create a repository such as `poetry-notes` and upload the frontend files plus the `poems/` folder. The backend can live in a separate private repository or the same repository.

## 2. GitHub OAuth App
On GitHub, create an OAuth App under Developer settings. Set:
- Homepage URL: your deployed frontend URL
- Authorization callback URL: `https://YOUR-BACKEND-DOMAIN/api/callback`

Keep the Client Secret private.

## 3. Backend environment variables
Deploy `api/` to a Node host such as Render, Railway, Fly.io, or another Node service. Set:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_OWNER` = your GitHub username
- `GITHUB_REPO` = `poetry-notes`
- `GITHUB_POEMS_DIR` = `poems`
- `GITHUB_REDIRECT_URI` = `https://YOUR-BACKEND-DOMAIN/api/callback`
- `FRONTEND_URL` = `https://YOUR-GITHUB-USERNAME.github.io/poetry-notes/`
- `SESSION_SECRET` = a long random secret

## 4. Connect frontend to backend
In `app.js`, change:
`const API='/api';`
to your backend URL, for example:
`const API='https://your-backend.example.com/api';`

## 5. GitHub Pages
Enable Pages for the repository from the main branch and root directory.

### Security
Do not put a GitHub personal access token, OAuth client secret, or other private credential in `index.html`, `app.js`, or any file deployed to GitHub Pages.
