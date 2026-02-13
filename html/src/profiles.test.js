import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileManager } from './profiles.js';

describe('ProfileManager', () => {
  let container;
  let profileManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    profileManager = new ProfileManager(container);
  });

  describe('renderProfileList', () => {
    it('should render empty state when no profiles exist', async () => {
      const profiles = [];
      await profileManager.renderProfileList(profiles);

      const emptyState = container.querySelector('.profiles-empty');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No profiles yet');
    });

    it('should render list of profiles with name and avatar', async () => {
      const profiles = [
        { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' },
        { id: '2', name: 'Noah', avatar: '👦', pin: '5678' },
      ];
      await profileManager.renderProfileList(profiles);

      const profileCards = container.querySelectorAll('.profile-card');
      expect(profileCards.length).toBe(2);
      expect(profileCards[0].textContent).toContain('Emma');
      expect(profileCards[0].textContent).toContain('🧒');
    });

    it('should render edit and delete buttons for each profile', async () => {
      const profiles = [
        { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' },
      ];
      await profileManager.renderProfileList(profiles);

      const editBtn = container.querySelector('[data-action="edit"]');
      const deleteBtn = container.querySelector('[data-action="delete"]');
      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeTruthy();
    });
  });

  describe('renderProfileForm', () => {
    it('should render profile creation form', () => {
      profileManager.renderProfileForm();

      const form = container.querySelector('form[data-form="profile"]');
      const nameInput = container.querySelector('input[name="name"]');
      const avatarInput = container.querySelector('input[name="avatar"]');
      const pinInput = container.querySelector('input[name="pin"]');

      expect(form).toBeTruthy();
      expect(nameInput).toBeTruthy();
      expect(avatarInput).toBeTruthy();
      expect(pinInput).toBeTruthy();
    });

    it('should render form with existing profile data for editing', () => {
      const profile = { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' };
      profileManager.renderProfileForm(profile);

      const nameInput = container.querySelector('input[name="name"]');
      const avatarInput = container.querySelector('input[name="avatar"]');
      const pinInput = container.querySelector('input[name="pin"]');

      expect(nameInput.value).toBe('Emma');
      expect(avatarInput.value).toBe('🧒');
      expect(pinInput.value).toBe('1234');
    });

    it('should have submit button with correct label', () => {
      profileManager.renderProfileForm();
      const submitBtn = container.querySelector('button[type="submit"]');
      expect(submitBtn.textContent).toContain('Create Profile');

      const profile = { id: '1', name: 'Emma', avatar: '🧒', pin: '1234' };
      profileManager.renderProfileForm(profile);
      const editSubmitBtn = container.querySelector('button[type="submit"]');
      expect(editSubmitBtn.textContent).toContain('Update Profile');
    });
  });

  describe('form validation', () => {
    it('should validate required fields', async () => {
      profileManager.renderProfileForm();
      const form = container.querySelector('form[data-form="profile"]');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorMsg = container.querySelector('.error-message');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('required');
    });

    it('should validate PIN is 4 digits', async () => {
      profileManager.renderProfileForm();
      const nameInput = container.querySelector('input[name="name"]');
      const avatarInput = container.querySelector('input[name="avatar"]');
      const pinInput = container.querySelector('input[name="pin"]');

      nameInput.value = 'Test';
      avatarInput.value = '👦';
      pinInput.value = '123'; // Only 3 digits

      const form = container.querySelector('form[data-form="profile"]');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorMsg = container.querySelector('.error-message');
      expect(errorMsg.textContent).toContain('4 digits');
    });
  });
});
