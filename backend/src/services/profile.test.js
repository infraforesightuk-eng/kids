import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import DatabaseService from './database.js';
import ProfileService from './profile.js';

describe('Profile Service', () => {
  let dbService;
  let db;
  let profileService;
  const dbPath = path.resolve(process.cwd(), 'test-profile.db');

  beforeAll(async () => {
    // Clean up previous test database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    // Initialize database with schema
    dbService = new DatabaseService(dbPath);
    await dbService.connect();
    db = dbService.getConnection();

    // Initialize service with shared connection
    profileService = new ProfileService(db);
  });

  afterAll(async () => {
    if (dbService) {
      await dbService.disconnect();
    }
    // Clean up test database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new profile', async () => {
    const profile = await profileService.createProfile('Test Child', 'boy-1');
    expect(profile.id).toBeDefined();
    expect(profile.name).toBe('Test Child');
    expect(profile.avatar).toBe('boy-1');
    expect(profile.pin).toBeNull();

    // Verify in database
    const dbProfile = await db.get('SELECT * FROM Profile WHERE id = ?', profile.id);
    expect(dbProfile).toBeDefined();
    expect(dbProfile.name).toBe('Test Child');
  });

  it('should retrieve a profile by ID', async () => {
    const createdProfile = await profileService.createProfile('Another Child', 'girl-1', '1234');
    const retrievedProfile = await profileService.getProfileById(createdProfile.id);

    expect(retrievedProfile).toBeDefined();
    expect(retrievedProfile.id).toBe(createdProfile.id);
    expect(retrievedProfile.name).toBe('Another Child');
    expect(retrievedProfile.avatar).toBe('girl-1');
    expect(retrievedProfile.pin).toBe('1234');
  });

  it('should update an existing profile', async () => {
    const createdProfile = await profileService.createProfile('Child to Update', 'old-avatar');
    const updatedProfile = await profileService.updateProfile(createdProfile.id, 'Updated Child', 'new-avatar', '5678');

    expect(updatedProfile).toBeDefined();
    expect(updatedProfile.id).toBe(createdProfile.id);
    expect(updatedProfile.name).toBe('Updated Child');
    expect(updatedProfile.avatar).toBe('new-avatar');
    expect(updatedProfile.pin).toBe('5678');

    // Verify in database
    const dbProfile = await db.get('SELECT * FROM Profile WHERE id = ?', createdProfile.id);
    expect(dbProfile.name).toBe('Updated Child');
    expect(dbProfile.avatar).toBe('new-avatar');
    expect(dbProfile.pin).toBe('5678');
  });

  it('should delete a profile by ID', async () => {
    const createdProfile = await profileService.createProfile('Child to Delete', 'avatar-del');
    await profileService.deleteProfile(createdProfile.id);

    const deletedProfile = await profileService.getProfileById(createdProfile.id);
    expect(deletedProfile).toBeUndefined();

    // Verify in database
    const dbProfile = await db.get('SELECT * FROM Profile WHERE id = ?', createdProfile.id);
    expect(dbProfile).toBeUndefined();
  });

  it('should retrieve all profiles', async () => {
    // Clean database first
    await db.run('DELETE FROM Profile');

    // Create multiple profiles with delays to ensure different timestamps
    const profile1 = await profileService.createProfile('Profile 1', '👧', '1111');
    await new Promise(resolve => setTimeout(resolve, 10));
    const profile2 = await profileService.createProfile('Profile 2', '👦', '2222');
    await new Promise(resolve => setTimeout(resolve, 10));
    const profile3 = await profileService.createProfile('Profile 3', '🧒', '3333');

    const allProfiles = await profileService.getAllProfiles();
    expect(allProfiles).toBeDefined();
    expect(allProfiles.length).toBe(3);
    // Ordered by createdAt DESC (newest first)
    expect(allProfiles[0].name).toBe('Profile 3');
    expect(allProfiles[1].name).toBe('Profile 2');
    expect(allProfiles[2].name).toBe('Profile 1');
  });
});