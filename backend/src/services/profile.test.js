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
});
