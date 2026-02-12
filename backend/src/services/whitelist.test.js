import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import WhitelistService from './whitelist'; // Import the service

describe('Whitelist Service', () => {
  let db;
  let whitelistService;
  const dbPath = path.resolve(process.cwd(), 'test-whitelist.db'); // Unique DB for whitelist tests

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

    // Apply schema for Profile and Whitelist tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        pin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Whitelist (
        id TEXT PRIMARY KEY,
        profileId TEXT NOT NULL,
        tmdbId TEXT NOT NULL,
        mediaType TEXT NOT NULL,
        addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profileId, tmdbId, mediaType),
        FOREIGN KEY(profileId) REFERENCES Profile(id) ON DELETE CASCADE
      );
    `);

    whitelistService = new WhitelistService(dbPath);
    await whitelistService.connect();
  });

  afterAll(async () => {
    if (whitelistService) {
      await whitelistService.disconnect();
    }
    // Clean up test database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should add a content item to a profile whitelist', async () => {
    const profileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name) VALUES (?, ?)', [profileId, 'Test Child']);

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
    await db.run('INSERT INTO Profile (id, name) VALUES (?, ?)', [profileId, 'Whitelist Child']);

    await whitelistService.addContentToWhitelist(profileId, 'TMDB1', 'movie');
    await whitelistService.addContentToWhitelist(profileId, 'TMDB2', 'tv');
    await whitelistService.addContentToWhitelist(uuidv4(), 'TMDB3', 'movie'); // Another profile's content

    const whitelist = await whitelistService.getWhitelistByProfileId(profileId);

    expect(whitelist).toBeDefined();
    expect(whitelist.length).toBe(2);
    expect(whitelist[0].tmdbId).toBe('TMDB1');
    expect(whitelist[1].tmdbId).toBe('TMDB2');
    expect(whitelist[0].profileId).toBe(profileId);
  });
});
