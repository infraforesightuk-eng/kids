# Content Discovery and Filtering Implementation Plan

## Goal Description

Enhance the "See All" page (`html/seeall.html`) to support rich content discovery. This includes adding filtering options for **Streaming Providers** (e.g., Netflix, Prime Video) and **Genres** (e.g., Comedy, Sci-Fi) within each main section (Movies, TV Shows, Animation).

## Proposed Changes

### HTML

#### [MODIFY] [seeall.html](file:///home/brett/kids/html/seeall.html)

- Add a filter bar below the header containing:
  - A dropdown/select for **Provider** (defaulting to "All Providers").
  - A dropdown/select for **Genre** (defaulting to "All Genres").
- Use Tailwind CSS to style these inputs to match the existing "Netflix-like" dark aesthetic (dark background, light text, red accents/focus states).

# Server Selection & Defaults Update

The user wants to make "Premium" the default server and change the UI from buttons to a dropdown for a cleaner look.

## Proposed Changes

### [Watch Interface]

#### [MODIFY] [watch.js](file:///home/brett/kids/html/src/watch.js)

- Update `currentServerUrl` to `'https://player.videasy.net/embed/'` (Netflix).
  > [!NOTE]
  > We initially set this to Premium, but reverted to Netflix as the default because the Premium server showed intermittent loading issues (black screen) on the production domain during initial page load.
- Update `WatchMovie` and `WatchTV` to render a `<select>` dropdown within a `.server-dropdown` container.
- Update `changeServer` to handle the dropdown interaction, removing button-specific logic.

#### [MODIFY] [watch.css](file:///home/brett/kids/html/watch.css)

- Add styling for `.server-dropdown` using the same premium design as the season selector.
- Ensure the dropdown is centered and responsive.

## Verification Plan

### Automated Tests

- Use browser-subagent to:
  - Verify that the page loads with the Premium server selected by default.
  - Verify that the server selection is now a dropdown.
  - Test changing the server via the dropdown and ensure the iframe updates.

### Advanced Discovery Features (New)

To provide a richer experience, we will add a **"More Filters"** toggle that reveals:

- **Sort By**: Options for Popularity (Default), Top Rated, Newest Releases.
- **Era / Year**: Quick filters for "Released this year", "2020s", "2010s", "Classic (Pre-2000)".
- **Minimum Rating**: Filter for "Good (>7.0)" or "Masterpiece (>8.5)" content.
- **"Vibe" Picker (Creative)**: A fun, curated list that maps to specific Genre/Keyword combinations:
  - *Adrenaline*: Action + Thriller
  - *Feel Good*: Comedy + Family + Animation
  - *Mind Bending*: Sci-Fi + Mystery + Psychological keywords
  - *Dark & Gritty*: Crime + Drama + Noir keywords

### JavaScript

#### [MODIFY] [see-all.js](file:///home/brett/kids/html/src/see-all.js)

- Add a constant list of top providers (Netflix, Amazon Prime, Disney+, etc.) with their TMDB provider IDs.
- Add configuration for new filters (Eras, Vibes, Sort Options).
- Add a function to fetch the list of genres from TMDB based on the current media type (movie/tv).
  - Note: For the "Animation" (16+) category, the genre filter should probably be restricted or handled carefully since it's already filtered by genre 16. I will append the selected genre to the existing '16'.
- Update the `fetchData` function to:
  - Read the selected values from all active filters.
  - Handle complex logic for "Vibes" (mapping them to `with_genres` and `without_genres` or specific `with_keywords`).
  - Append `&sort_by=` based on selection.
  - Append `primary_release_date.gte` and `.lte` for Era filtering.
  - Append `vote_average.gte` for Rating filtering.
  - Append `&with_watch_providers=ID` and `&watch_region=GB` if a provider is selected.
  - Append `&with_genres=ID` if a genre is selected (handling the existing `with_genres=16` for Animation).
- Add a "Reset Filters" button.
- Ensure all filters play nicely together (e.g. "Sci-Fi" Genre + "2020s" Era + "Netflix" Provider).
- Add event listeners to the filters to reset `currentPage` to 1, clear the grid, and call `fetchData` again upon change.

## Verification Plan

### Automated Tests

- None existing for the frontend UI interactions.

### Manual Verification

- **Setup**: Serve the `html` directory (e.g., using `python3 -m http.server` or similar, or just opening the file if CORS allows - likely need a server due to module/CORS).
- **Step 1**: Navigate to the "See All" page for **Trending Movies**.
  - Verify the "Provider" and "Genre" dropdowns handle appeared.
  - Select "Netflix" from the provider list.
  - Verify the grid updates and shows movies available on Netflix.
  - Select "Comedy" from the genre list.
  - Verify the grid updates to show Comedy movies on Netflix.
- **Step 2**: Navigate to **Popular TV Shows**.
  - Verify the filters reset or re-initialize.
  - Select a provider and genre and verify results.
- **Step 3**: Navigate to **16+ Animation**.
  - Verify filtering works alongside the pre-set generic filter.
