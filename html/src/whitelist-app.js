import { WhitelistManager } from './whitelist.js';

const API_BASE = 'http://localhost:3000/api';
const TMDB_API_KEY = '97df57ffd9278a37bc12191e00332053';
const TMDB_BASE = 'https://api.themoviedb.org/3';

class WhitelistApp {
  constructor() {
    this.container = document.getElementById('whitelist-container');
    this.whitelistManager = new WhitelistManager(this.container);
    this.profileId = null;
    this.profile = null;
    this.whitelist = [];
    this.mode = 'list'; // 'list' or 'search'
    this.init();
  }

  async init() {
    // Get profile ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    this.profileId = params.get('profileId');

    if (!this.profileId) {
      alert('No profile selected. Redirecting to profiles page.');
      window.location.href = 'profiles.html';
      return;
    }

    await this.loadProfile();
    this.setupEventListeners();
    await this.loadWhitelist();
  }

  setupEventListeners() {
    const searchBtn = document.getElementById('btn-search');
    const viewListBtn = document.getElementById('btn-view-list');
    const backBtn = document.getElementById('btn-back');

    searchBtn.addEventListener('click', () => this.showSearchMode());
    viewListBtn.addEventListener('click', () => this.showListMode());
    backBtn.addEventListener('click', () => window.location.href = 'profiles.html');

    // Listen for whitelist actions
    this.container.addEventListener('addToWhitelist', (e) => {
      this.addToWhitelist(e.detail);
    });

    this.container.addEventListener('removeFromWhitelist', (e) => {
      this.removeFromWhitelist(e.detail);
    });

    // Listen for search form submission
    this.container.addEventListener('submit', async (e) => {
      if (e.target.dataset.form === 'search') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('search');
        await this.searchContent(query);
      }
    });
  }

  async loadProfile() {
    try {
      const response = await fetch(`${API_BASE}/profiles/${this.profileId}`);

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      this.profile = await response.json();
      document.getElementById('profile-name').textContent = `Managing whitelist for ${this.profile.name}`;
    } catch (error) {
      console.error('Error loading profile:', error);
      this.showToast('Error loading profile', 'error');
    }
  }

  async loadWhitelist() {
    try {
      this.showLoading();
      const response = await fetch(`${API_BASE}/profiles/${this.profileId}/whitelist`);

      if (!response.ok) {
        throw new Error('Failed to load whitelist');
      }

      this.whitelist = await response.json();

      // Enrich whitelist with TMDB data
      await this.enrichWhitelistWithTMDB();

      this.whitelistManager.renderWhitelist(this.whitelist);
    } catch (error) {
      console.error('Error loading whitelist:', error);
      this.whitelist = [];
      this.whitelistManager.renderWhitelist(this.whitelist);
    }
  }

  async enrichWhitelistWithTMDB() {
    const enrichedPromises = this.whitelist.map(async (item) => {
      try {
        const endpoint = item.mediaType === 'movie' ? 'movie' : 'tv';
        const response = await fetch(
          `${TMDB_BASE}/${endpoint}/${item.tmdbId}?api_key=${TMDB_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          item.title = data.title || data.name;
          item.posterPath = data.poster_path;
        }
      } catch (error) {
        console.error(`Error enriching item ${item.tmdbId}:`, error);
      }
      return item;
    });

    this.whitelist = await Promise.all(enrichedPromises);
  }

  showSearchMode() {
    this.mode = 'search';
    this.whitelistManager.renderSearchInterface();
  }

  showListMode() {
    this.mode = 'list';
    this.loadWhitelist();
  }

  async searchContent(query) {
    try {
      this.showLoading();

      const response = await fetch(
        `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      // Filter to only movies and TV shows
      const results = data.results.filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );

      this.whitelistManager.renderSearchResults(results);
    } catch (error) {
      console.error('Error searching content:', error);
      this.showToast('Error searching content. Please try again.', 'error');
      this.whitelistManager.renderSearchResults([]);
    }
  }

  async addToWhitelist({ tmdbId, mediaType, title, posterPath }) {
    try {
      const response = await fetch(`${API_BASE}/profiles/${this.profileId}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId, mediaType }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to whitelist');
      }

      this.showToast(`Added "${title}" to whitelist!`, 'success');

      // Refresh the whitelist
      await this.loadWhitelist();
      this.showListMode();
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      this.showToast('Error adding to whitelist. Please try again.', 'error');
    }
  }

  async removeFromWhitelist({ tmdbId, mediaType }) {
    const item = this.whitelist.find(w => w.tmdbId === tmdbId && w.mediaType === mediaType);
    const title = item ? item.title : 'this content';

    if (!confirm(`Remove "${title}" from whitelist?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profiles/${this.profileId}/whitelist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId, mediaType }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from whitelist');
      }

      this.showToast(`Removed "${title}" from whitelist`, 'success');
      await this.loadWhitelist();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      this.showToast('Error removing from whitelist. Please try again.', 'error');
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Loading...</div>';
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }
}

// Export for testing
export default WhitelistApp;

// Initialize app when DOM is ready (only in browser, not in tests)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhitelistApp();
  });
}
