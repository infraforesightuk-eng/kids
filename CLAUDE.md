# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**movieIguess** (kids.btfm.uk) is a streaming platform for movies and TV shows with integrated parental controls. The project consists of:
- **Frontend** (`/html`): Vanilla JavaScript SPA using TMDB API for content discovery
- **Backend** (`/backend`): Node.js/Express API with SQLite for parental control features (profiles, whitelisting, time limits, activity logging)

The frontend uses HTML pages with modular JavaScript (home.js, search.js, view.js, watch.js) and TMDB API key for fetching movie/TV metadata. The backend manages child profiles and content restrictions.

## Common Commands

### Backend Development
```bash
# Run all tests
cd backend && npm test

# Run tests in watch mode
cd backend && npm test -- --watch

# Run specific test file
cd backend && npm test profile.test.js

# Start API server (development)
cd backend && node src/index.js
```

### Frontend Development
The frontend is static HTML/JS. Use a local server:
```bash
cd html
npx vite
```

### Database
The SQLite database (`parental-controls.db`) is created automatically on first run. Schema is in `backend/db/schema.sql` with tables: Profile, Whitelist, TimeLimit, ActivityLog.

## Architecture

### Backend Service Layer Pattern
The backend uses a **service-based architecture** where each domain (profiles, whitelist, time limits, activity) has its own service class:

- **Service Classes** (`backend/src/services/`): Each service manages its own database connection and encapsulates domain logic (ProfileService, WhitelistService)
- **Express App Factory** (`backend/src/app.js`): Creates an Express app with service instances injected via middleware (`req.profileService`, `req.whitelistService`)
- **Connection Middleware**: Services connect to the database on first request (lazy initialization)
- **Entry Point** (`backend/src/index.js`): Configures database path from `DATABASE_URL` env var or defaults to `parental-controls.db`

This pattern allows for easy testing (services can be instantiated with test database paths) and clean separation of concerns.

### Frontend Architecture
The frontend is page-based with shared JavaScript modules:
- **index.html** → `home.js`: Homepage with featured content and category rows
- **search.html** → `search.js`: Search interface
- **viewMovie.html** → `view.js`: Movie/TV detail pages
- **WatchMovie.html** → `watch.js`: Video player with embedded streams
- **Shared utilities**: `toast.js` (notifications), `loading.js` (loading states)

All pages use the TMDB API (key stored in frontend JS) for fetching movie/TV metadata. The backend API will eventually enforce parental controls.

## Testing Approach

Backend tests use Vitest with:
- **Per-test database isolation**: Each test creates a unique temporary database file
- **Sequential execution**: `vitest.config.js` disables concurrent tests to avoid database conflicts
- **Service-level testing**: Tests instantiate services directly with test database paths
- **Integration tests**: `app.test.js` uses supertest to test HTTP endpoints

Example test pattern:
```javascript
const dbPath = path.resolve(__dirname, `test-${Date.now()}-${Math.random()}.db`);
const service = new ProfileService(dbPath);
await service.connect();
// ... test code ...
await service.disconnect();
await fs.unlink(dbPath); // cleanup
```

## Current Development Status

Phase 1 (Backend API for profiles and whitelisting) is nearly complete. See `conductor/tracks/implement_parental_control_dashboard_20260212/plan.md` for detailed progress tracking.

Completed:
- Database schema (Profile, Whitelist, TimeLimit, ActivityLog)
- Profile CRUD API endpoints
- Whitelist management API endpoints (add, get, remove)

Next steps:
- Frontend UI for profile management
- Time limit and activity monitoring features
