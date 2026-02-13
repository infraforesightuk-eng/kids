import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhitelistManager } from './whitelist.js';

describe('WhitelistManager', () => {
  let container;
  let whitelistManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    whitelistManager = new WhitelistManager(container);
  });

  describe('renderWhitelist', () => {
    it('should render empty state when no whitelisted content exists', async () => {
      const whitelist = [];
      await whitelistManager.renderWhitelist(whitelist);

      const emptyState = container.querySelector('.whitelist-empty');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No whitelisted content');
    });

    it('should render list of whitelisted content items', async () => {
      const whitelist = [
        { id: '1', profileId: 'p1', tmdbId: '550', mediaType: 'movie', title: 'Fight Club', posterPath: '/poster1.jpg' },
        { id: '2', profileId: 'p1', tmdbId: '1396', mediaType: 'tv', title: 'Breaking Bad', posterPath: '/poster2.jpg' },
      ];
      await whitelistManager.renderWhitelist(whitelist);

      const items = container.querySelectorAll('.whitelist-item');
      expect(items.length).toBe(2);
      expect(container.textContent).toContain('Fight Club');
      expect(container.textContent).toContain('Breaking Bad');
    });

    it('should render remove button for each whitelisted item', async () => {
      const whitelist = [
        { id: '1', profileId: 'p1', tmdbId: '550', mediaType: 'movie', title: 'Fight Club', posterPath: '/poster1.jpg' },
      ];
      await whitelistManager.renderWhitelist(whitelist);

      const removeBtn = container.querySelector('[data-action="remove"]');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.dataset.tmdbId).toBe('550');
      expect(removeBtn.dataset.mediaType).toBe('movie');
    });

    it('should display media type badge for each item', async () => {
      const whitelist = [
        { id: '1', profileId: 'p1', tmdbId: '550', mediaType: 'movie', title: 'Fight Club', posterPath: '/poster1.jpg' },
        { id: '2', profileId: 'p1', tmdbId: '1396', mediaType: 'tv', title: 'Breaking Bad', posterPath: '/poster2.jpg' },
      ];
      await whitelistManager.renderWhitelist(whitelist);

      const badges = container.querySelectorAll('.media-type-badge');
      expect(badges.length).toBe(2);
    });
  });

  describe('renderSearchInterface', () => {
    it('should render search form with input and button', () => {
      whitelistManager.renderSearchInterface();

      const searchForm = container.querySelector('form[data-form="search"]');
      const searchInput = container.querySelector('input[name="search"]');
      const searchBtn = container.querySelector('button[type="submit"]');

      expect(searchForm).toBeTruthy();
      expect(searchInput).toBeTruthy();
      expect(searchBtn).toBeTruthy();
    });

    it('should have placeholder text in search input', () => {
      whitelistManager.renderSearchInterface();

      const searchInput = container.querySelector('input[name="search"]');
      expect(searchInput.placeholder).toContain('Search');
    });
  });

  describe('renderSearchResults', () => {
    it('should render search results with add buttons', async () => {
      const results = [
        { id: 550, title: 'Fight Club', media_type: 'movie', poster_path: '/poster1.jpg' },
        { id: 1396, name: 'Breaking Bad', media_type: 'tv', poster_path: '/poster2.jpg' },
      ];
      await whitelistManager.renderSearchResults(results);

      const resultItems = container.querySelectorAll('.search-result-item');
      expect(resultItems.length).toBe(2);

      const addButtons = container.querySelectorAll('[data-action="add"]');
      expect(addButtons.length).toBe(2);
      expect(addButtons[0].dataset.tmdbId).toBe('550');
      expect(addButtons[0].dataset.mediaType).toBe('movie');
    });

    it('should show no results message when search returns empty', async () => {
      const results = [];
      await whitelistManager.renderSearchResults(results);

      const noResults = container.querySelector('.no-results');
      expect(noResults).toBeTruthy();
      expect(noResults.textContent).toContain('No results');
    });

    it('should handle both movie and TV show titles correctly', async () => {
      const results = [
        { id: 550, title: 'Fight Club', media_type: 'movie', poster_path: '/poster1.jpg' },
        { id: 1396, name: 'Breaking Bad', media_type: 'tv', poster_path: '/poster2.jpg' },
      ];
      await whitelistManager.renderSearchResults(results);

      expect(container.textContent).toContain('Fight Club');
      expect(container.textContent).toContain('Breaking Bad');
    });
  });

  describe('event handling', () => {
    it('should emit addToWhitelist event when add button clicked', async () => {
      const results = [
        { id: 550, title: 'Fight Club', media_type: 'movie', poster_path: '/poster1.jpg' },
      ];
      await whitelistManager.renderSearchResults(results);

      let eventFired = false;
      let eventDetail = null;

      container.addEventListener('addToWhitelist', (e) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const addBtn = container.querySelector('[data-action="add"]');
      addBtn.click();

      expect(eventFired).toBe(true);
      expect(eventDetail.tmdbId).toBe('550');
      expect(eventDetail.mediaType).toBe('movie');
    });

    it('should emit removeFromWhitelist event when remove button clicked', async () => {
      const whitelist = [
        { id: '1', profileId: 'p1', tmdbId: '550', mediaType: 'movie', title: 'Fight Club', posterPath: '/poster1.jpg' },
      ];
      await whitelistManager.renderWhitelist(whitelist);

      let eventFired = false;
      let eventDetail = null;

      container.addEventListener('removeFromWhitelist', (e) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const removeBtn = container.querySelector('[data-action="remove"]');
      removeBtn.click();

      expect(eventFired).toBe(true);
      expect(eventDetail.tmdbId).toBe('550');
      expect(eventDetail.mediaType).toBe('movie');
    });
  });
});
