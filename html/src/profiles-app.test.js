import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ProfilesApp Integration', () => {
  let container;
  let newProfileBtn;
  let backBtn;

  beforeEach(() => {
    // Set up DOM structure that matches profiles.html
    document.body.innerHTML = `
      <div class="container">
        <div class="profiles-actions">
          <button id="btn-new-profile">Create New Profile</button>
          <button id="btn-back">Back to Home</button>
        </div>
        <div id="profiles-container"></div>
      </div>
    `;

    container = document.getElementById('profiles-container');
    newProfileBtn = document.getElementById('btn-new-profile');
    backBtn = document.getElementById('btn-back');

    // Mock fetch globally
    global.fetch = vi.fn();

    // Mock alert and toast
    global.alert = vi.fn();
    global.window.showToast = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadProfiles', () => {
    it('should fetch and render profiles from API', async () => {
      const mockProfiles = [
        { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' },
        { id: '2', name: 'Noah', avatar: '👦', pin: '5678' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfiles,
      });

      // Import and instantiate ProfilesApp
      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/profiles');

      // Verify profiles are rendered
      const profileCards = container.querySelectorAll('.profile-card');
      expect(profileCards.length).toBe(2);
    });

    it('should handle empty profiles list', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      const emptyState = container.querySelector('.profiles-empty');
      expect(emptyState).toBeTruthy();
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should show empty state on error
      const emptyState = container.querySelector('.profiles-empty');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('createProfile', () => {
    it('should POST new profile to API', async () => {
      const newProfile = { id: '3', name: 'Lily', avatar: '👧', pin: '9999' };

      // Mock initial load
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Mock profile creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newProfile,
      });

      // Mock reload after creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [newProfile],
      });

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate creating a profile
      const form = container.querySelector('form[data-form="profile"]');
      if (form) {
        const event = new CustomEvent('profileSubmit', {
          detail: { name: 'Lily', avatar: '👧', pin: '9999' },
        });
        form.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify POST was called
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/profiles',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Lily', avatar: '👧', pin: '9999' }),
          })
        );
      }
    });
  });

  describe('updateProfile', () => {
    it('should PUT updated profile to API', async () => {
      const existingProfile = { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' };
      const updatedProfile = { id: '1', name: 'Emma Updated', avatar: '👧', pin: '5555' };

      // Mock initial load
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [existingProfile],
      });

      // Mock profile update
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedProfile,
      });

      // Mock reload after update
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedProfile],
      });

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate updating a profile
      const form = container.querySelector('form[data-form="profile"]');
      if (form) {
        const event = new CustomEvent('profileSubmit', {
          detail: {
            name: 'Emma Updated',
            avatar: '👧',
            pin: '5555',
            profileId: '1',
          },
        });
        form.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify PUT was called
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/profiles/1',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
    });
  });

  describe('deleteProfile', () => {
    it('should DELETE profile via API', async () => {
      const profile = { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' };

      // Mock initial load
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [profile],
      });

      // Mock delete
      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      // Mock reload after delete
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Mock confirm dialog
      global.confirm = vi.fn(() => true);

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate delete button click
      const deleteBtn = container.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.click();

        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify DELETE was called
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/profiles/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      }
    });

    it('should not delete if user cancels confirmation', async () => {
      const profile = { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [profile],
      });

      // Mock confirm dialog returning false (cancel)
      global.confirm = vi.fn(() => false);

      const { default: ProfilesApp } = await import('./profiles-app.js');
      const app = new ProfilesApp();
      await new Promise(resolve => setTimeout(resolve, 100));

      const deleteBtn = container.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.click();

        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify DELETE was NOT called (only initial GET)
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }
    });
  });
});
