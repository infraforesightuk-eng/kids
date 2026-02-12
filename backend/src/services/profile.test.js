import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import ProfileService from './profile'; // Import the service

describe('Profile Service', () => {
  let db;
  let profileService;
  const dbPath = path.resolve(process.cwd(), 'test-profile.db'); // Unique DB for profile tests

  beforeAll(async () => {
    // Clean up previous test database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    // Open a new database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Apply schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        pin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    profileService = new ProfileService(dbPath);
    await profileService.connect();
  });

  afterAll(async () => {
    if (profileService) {
      await profileService.disconnect();
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
});