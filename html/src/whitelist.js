/**
 * WhitelistManager class handles rendering and managing content whitelist UI
 */
export class WhitelistManager {
  /**
   * @param {HTMLElement} container - The container element for the whitelist UI
   */
  constructor(container) {
    this.container = container;
  }

  /**
   * Renders the list of whitelisted content
   * @param {Array} whitelist - Array of whitelisted content items
   */
  async renderWhitelist(whitelist) {
    if (!whitelist || whitelist.length === 0) {
      this.container.innerHTML = `
        <div class="whitelist-empty">
          <p>No whitelisted content yet. Search and add movies or TV shows!</p>
        </div>
      `;
      return;
    }

    const whitelistHtml = whitelist.map(item => {
      const title = item.title || item.name;
      const posterUrl = item.posterPath
        ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
        : '/placeholder.jpg';

      return `
        <div class="whitelist-item" data-id="${item.id}">
          <img src="${posterUrl}" alt="${title}" class="whitelist-poster">
          <div class="whitelist-info">
            <h3 class="whitelist-title">${title}</h3>
            <span class="media-type-badge ${item.mediaType}">${item.mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
          </div>
          <button
            class="btn-remove"
            data-action="remove"
            data-tmdb-id="${item.tmdbId}"
            data-media-type="${item.mediaType}"
          >
            Remove
          </button>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="whitelist-list">
        ${whitelistHtml}
      </div>
    `;

    this.setupWhitelistEvents();
  }

  /**
   * Renders the search interface for finding content
   */
  renderSearchInterface() {
    this.container.innerHTML = `
      <form data-form="search" class="search-form">
        <input
          type="text"
          name="search"
          placeholder="Search for movies or TV shows..."
          required
        />
        <button type="submit" class="btn-search">Search</button>
      </form>
      <div id="search-results"></div>
    `;
  }

  /**
   * Renders search results
   * @param {Array} results - Array of search results from TMDB
   */
  async renderSearchResults(results) {
    const resultsContainer = this.container.querySelector('#search-results')
      || this.container;

    if (!results || results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p>No results found. Try a different search term.</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results.map(item => {
      const title = item.title || item.name;
      const posterUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
        : '/placeholder.jpg';

      return `
        <div class="search-result-item" data-tmdb-id="${item.id}">
          <img src="${posterUrl}" alt="${title}" class="result-poster">
          <div class="result-info">
            <h3 class="result-title">${title}</h3>
            <span class="media-type-badge ${item.media_type}">${item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
          </div>
          <button
            class="btn-add"
            data-action="add"
            data-tmdb-id="${item.id}"
            data-media-type="${item.media_type}"
            data-title="${title}"
            data-poster="${item.poster_path || ''}"
          >
            Add to Whitelist
          </button>
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = `
      <div class="search-results-list">
        ${resultsHtml}
      </div>
    `;

    this.setupSearchResultEvents();
  }

  /**
   * Sets up event listeners for whitelist items
   */
  setupWhitelistEvents() {
    const removeButtons = this.container.querySelectorAll('[data-action="remove"]');

    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tmdbId = e.target.dataset.tmdbId;
        const mediaType = e.target.dataset.mediaType;

        const event = new CustomEvent('removeFromWhitelist', {
          detail: { tmdbId, mediaType },
        });
        this.container.dispatchEvent(event);
      });
    });
  }

  /**
   * Sets up event listeners for search result items
   */
  setupSearchResultEvents() {
    const addButtons = this.container.querySelectorAll('[data-action="add"]');

    addButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tmdbId = e.target.dataset.tmdbId;
        const mediaType = e.target.dataset.mediaType;
        const title = e.target.dataset.title;
        const posterPath = e.target.dataset.poster;

        const event = new CustomEvent('addToWhitelist', {
          detail: { tmdbId, mediaType, title, posterPath },
        });
        this.container.dispatchEvent(event);
      });
    });
  }
}
