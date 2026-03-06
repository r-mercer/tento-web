# tento-web

React + TypeScript frontend for Tento, built with Vite and Fluent UI.

## Tech Stack

- React 19 + TypeScript
- Vite (`rolldown-vite`)
- Fluent UI (`@fluentui/react-components`)
- TanStack Query for server state
- REST via Axios + GraphQL via `graphql-request`
- React Router DOM

## Requirements

- Node.js 20+ (recommended)
- npm

## Scripts

```bash
cd components/ui/tento-web

# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check + production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` in this directory with:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GH_CLIENT_ID=your-github-client-id
VITE_GH_REDIRECT_URI=http://localhost:5173/auth/callback
```

## App Architecture (High Level)

- `src/api/`: REST + GraphQL clients
- `src/contexts/`: `AuthContext` and `ThemeContext`
- `src/hooks/`: API and auth/session hooks
- `src/components/`: reusable UI and quiz components
- `src/pages/`: route-level pages (quiz create/edit, GraphQL playground)
- `src/types/`: API/domain types

## Notes

- Authentication uses GitHub OAuth + JWT (access/refresh tokens).
- Session management includes proactive token refresh, inactivity timeout, and periodic validation.
- Run `npm run test` or `npm run test:watch` to execute Vitest tests.
