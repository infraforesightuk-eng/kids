/**
 * ProfileManager class handles rendering and managing child profile UI
 */
export class ProfileManager {
  /**
   * @param {HTMLElement} container - The container element for the profile UI
   */
  constructor(container) {
    this.container = container;
    this.currentProfile = null;
  }

  /**
   * Renders a list of profiles
   * @param {Array} profiles - Array of profile objects
   */
  async renderProfileList(profiles) {
    this.container.innerHTML = '';

    if (!profiles || profiles.length === 0) {
      this.container.innerHTML = `
        <div class="profiles-empty">
          <p>No profiles yet. Create one to get started!</p>
        </div>
      `;
      return;
    }

    const profilesHtml = profiles.map(profile => `
      <div class="profile-card" data-profile-id="${profile.id}">
        <div class="profile-avatar">${profile.avatar}</div>
        <div class="profile-name">${profile.name}</div>
        <div class="profile-actions">
          <button class="btn-edit" data-action="edit" data-profile-id="${profile.id}">
            Edit
          </button>
          <button class="btn-delete" data-action="delete" data-profile-id="${profile.id}">
            Delete
          </button>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="profiles-list">
        ${profilesHtml}
      </div>
    `;
  }

  /**
   * Renders a profile creation/edit form
   * @param {Object|null} profile - Profile object to edit, or null for new profile
   */
  renderProfileForm(profile = null) {
    this.currentProfile = profile;
    const isEdit = profile !== null;

    this.container.innerHTML = `
      <form data-form="profile" class="profile-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value="${profile ? profile.name : ''}"
            required
          />
        </div>

        <div class="form-group">
          <label for="avatar">Avatar (emoji)</label>
          <input
            type="text"
            name="avatar"
            id="avatar"
            value="${profile ? profile.avatar : ''}"
            required
          />
        </div>

        <div class="form-group">
          <label for="pin">PIN (4 digits)</label>
          <input
            type="text"
            name="pin"
            id="pin"
            value="${profile ? profile.pin : ''}"
            maxlength="4"
            pattern="\\d{4}"
            required
          />
        </div>

        <div class="error-message" style="display: none;"></div>

        <button type="submit" class="btn-submit">
          ${isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    `;

    this.setupFormValidation();
  }

  /**
   * Sets up form validation
   */
  setupFormValidation() {
    const form = this.container.querySelector('form[data-form="profile"]');
    const errorMsg = this.container.querySelector('.error-message');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name');
      const avatar = formData.get('avatar');
      const pin = formData.get('pin');

      // Validate required fields
      if (!name || !avatar || !pin) {
        errorMsg.textContent = 'All fields are required';
        errorMsg.style.display = 'block';
        return;
      }

      // Validate PIN is 4 digits
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        errorMsg.textContent = 'PIN must be 4 digits';
        errorMsg.style.display = 'block';
        return;
      }

      // Clear error if validation passes
      errorMsg.style.display = 'none';

      // Form is valid - emit custom event for handling
      const event = new CustomEvent('profileSubmit', {
        detail: { name, avatar, pin, profileId: this.currentProfile?.id },
      });
      form.dispatchEvent(event);
    });
  }
}
