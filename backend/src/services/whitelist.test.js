import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.js';
import WhitelistService from './whitelist.js';

describe('Whitelist Service', () => {
  let dbService;
  let db;
  let whitelistService;
  const dbPath = path.resolve(process.cwd(), 'test-whitelist.db');

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
    whitelistService = new WhitelistService(db);
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

  it('should add a content item to a profile whitelist', async () => {
    const profileId = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO Profile (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [profileId, 'Test Child', now, now]);

    const whitelistItem = await whitelistService.addContentToWhitelist(profileId, '123', 'movie');

    expect(whitelistItem).toBeDefined();
    expect(whitelistItem.profileId).toBe(profileId);
    expect(whitelistItem.tmdbId).toBe('123');
    expect(whitelistItem.mediaType).toBe('movie');

    // Verify in database
    const dbWhitelistItem = await db.get('SELECT * FROM Whitelist WHERE id = ?', whitelistItem.id);
    expect(dbWhitelistItem).toBeDefined();
    expect(dbWhitelistItem.tmdbId).toBe('123');
  });

  it('should retrieve whitelist items by profile ID', async () => {
    const profileId = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO Profile (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [profileId, 'Whitelist Child', now, now]);

    // Create another profile for testing isolation
    const otherProfileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [otherProfileId, 'Other Child', now, now]);

    await whitelistService.addContentToWhitelist(profileId, 'TMDB1', 'movie');
    await whitelistService.addContentToWhitelist(profileId, 'TMDB2', 'tv');
    await whitelistService.addContentToWhitelist(otherProfileId, 'TMDB3', 'movie'); // Another profile's content

    const whitelist = await whitelistService.getWhitelistByProfileId(profileId);

    expect(whitelist).toBeDefined();
    expect(whitelist.length).toBe(2);
    expect(whitelist[0].tmdbId).toBe('TMDB2');
    expect(whitelist[1].tmdbId).toBe('TMDB1');
    expect(whitelist[0].profileId).toBe(profileId);
  });

  it('should remove a content item from a profile whitelist', async () => {
    const profileId = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO Profile (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [profileId, 'Remove Child', now, now]);

    const whitelistItem = await whitelistService.addContentToWhitelist(profileId, 'TMDB_REMOVE', 'movie');
    await whitelistService.removeContentFromWhitelist(profileId, 'TMDB_REMOVE', 'movie');

    const whitelist = await whitelistService.getWhitelistByProfileId(profileId);
    expect(whitelist).toHaveLength(0);

    // Verify in database
    const dbWhitelistItem = await db.get('SELECT * FROM Whitelist WHERE id = ?', whitelistItem.id);
    expect(dbWhitelistItem).toBeUndefined();
  });
});
