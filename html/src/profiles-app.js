import { ProfileManager } from './profiles.js';

const API_BASE = 'http://localhost:3000/api';

class ProfilesApp {
  constructor() {
    this.container = document.getElementById('profiles-container');
    this.profileManager = new ProfileManager(this.container);
    this.profiles = [];
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadProfiles();
  }

  setupEventListeners() {
    const newProfileBtn = document.getElementById('btn-new-profile');
    const backBtn = document.getElementById('btn-back');

    newProfileBtn.addEventListener('click', () => this.showCreateForm());
    backBtn.addEventListener('click', () => window.location.href = 'index.html');

    // Listen for profile actions
    this.container.addEventListener('click', (e) => {
      const target = e.target;

      if (target.dataset.action === 'edit') {
        const profileId = target.dataset.profileId;
        this.showEditForm(profileId);
      }

      if (target.dataset.action === 'delete') {
        const profileId = target.dataset.profileId;
        this.deleteProfile(profileId);
      }
    });

    // Listen for form submission
    this.container.addEventListener('profileSubmit', (e) => {
      this.handleFormSubmit(e.detail);
    });
  }

  async loadProfiles() {
    try {
      this.showLoading();
      const response = await fetch(`${API_BASE}/profiles`);

      if (!response.ok) {
        // If endpoint doesn't exist yet, show empty state
        this.profiles = [];
        this.profileManager.renderProfileList(this.profiles);
        return;
      }

      this.profiles = await response.json();
      this.profileManager.renderProfileList(this.profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      this.profiles = [];
      this.profileManager.renderProfileList(this.profiles);
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Loading profiles...</div>';
  }

  showCreateForm() {
    this.profileManager.renderProfileForm();
  }

  showEditForm(profileId) {
    const profile = this.profiles.find(p => p.id === profileId);
    if (profile) {
      this.profileManager.renderProfileForm(profile);
    }
  }

  async handleFormSubmit({ name, avatar, pin, profileId }) {
    try {
      if (profileId) {
        // Update existing profile
        await this.updateProfile(profileId, name, avatar, pin);
      } else {
        // Create new profile
        await this.createProfile(name, avatar, pin);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      this.showToast('Error saving profile. Please try again.', 'error');
    }
  }

  async createProfile(name, avatar, pin) {
    try {
      const response = await fetch(`${API_BASE}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar, pin }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const newProfile = await response.json();
      this.profiles.push(newProfile);
      this.showToast(`Profile "${name}" created successfully!`, 'success');
      await this.loadProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      this.showToast('Error creating profile. Please try again.', 'error');
    }
  }

  async updateProfile(id, name, avatar, pin) {
    try {
      const response = await fetch(`${API_BASE}/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar, pin }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      const index = this.profiles.findIndex(p => p.id === id);
      if (index !== -1) {
        this.profiles[index] = updatedProfile;
      }

      this.showToast(`Profile "${name}" updated successfully!`, 'success');
      await this.loadProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showToast('Error updating profile. Please try again.', 'error');
    }
  }

  async deleteProfile(id) {
    const profile = this.profiles.find(p => p.id === id);
    if (!profile) return;

    if (!confirm(`Are you sure you want to delete the profile "${profile.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      this.profiles = this.profiles.filter(p => p.id !== id);
      this.showToast(`Profile "${profile.name}" deleted successfully!`, 'success');
      await this.loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      this.showToast('Error deleting profile. Please try again.', 'error');
    }
  }

  showToast(message, type = 'info') {
    // Assuming toast functionality exists (from toast.js)
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }
}

// Export for testing
export default ProfilesApp;

// Initialize app when DOM is ready (only in browser, not in tests)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProfilesApp();
  });
}
