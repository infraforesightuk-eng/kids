import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

describe('Database Schema', () => {
  let db;
  const dbPath = path.resolve(process.cwd(), 'test-schema.db'); // Unique DB for schema tests

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

    // Read and apply schema from schema.sql
    const schemaSql = fs.readFileSync(path.resolve(__dirname, './db/schema.sql'), 'utf8');
    await db.exec(schemaSql);
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
    // Clean up test database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new profile', async () => {
    const profileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name, avatar) VALUES (?, ?, ?)', [profileId, 'Test Child', 'boy-1']);
    const profile = await db.get('SELECT * FROM Profile WHERE id = ?', profileId);
    expect(profile).toBeDefined();
    expect(profile.name).toBe('Test Child');
  });

  it('should add content to whitelist', async () => {
    const profileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name) VALUES (?, ?)', [profileId, 'Whitelist User']);

    const whitelistItemId = uuidv4();
    await db.run('INSERT INTO Whitelist (id, profileId, tmdbId, mediaType) VALUES (?, ?, ?, ?)', [whitelistItemId, profileId, '12345', 'movie']);
    const whitelistItem = await db.get('SELECT * FROM Whitelist WHERE id = ?', whitelistItemId);

    expect(whitelistItem.tmdbId).toBe('12345');
    expect(whitelistItem.profileId).toBe(profileId);
  });

  it('should enforce unique constraint on whitelist', async () => {
    const profileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name) VALUES (?, ?)', [profileId, 'Unique User']);

    const whitelistItemId1 = uuidv4();
    await db.run('INSERT INTO Whitelist (id, profileId, tmdbId, mediaType) VALUES (?, ?, ?, ?)', [whitelistItemId1, profileId, '555', 'movie']);

    const whitelistItemId2 = uuidv4();
    await expect(
      db.run('INSERT INTO Whitelist (id, profileId, tmdbId, mediaType) VALUES (?, ?, ?, ?)', [whitelistItemId2, profileId, '555', 'movie'])
    ).rejects.toThrow();
  });

  it('should enforce unique constraint on time limit profileId', async () => {
    const profileId = uuidv4();
    await db.run('INSERT INTO Profile (id, name) VALUES (?, ?)', [profileId, 'TimeLimit User']);

    const timeLimitId1 = uuidv4();
    await db.run('INSERT INTO TimeLimit (id, profileId, dailyLimitMinutes) VALUES (?, ?, ?)', [timeLimitId1, profileId, 60]);

    const timeLimitId2 = uuidv4();
    await expect(
      db.run('INSERT INTO TimeLimit (id, profileId, dailyLimitMinutes) VALUES (?, ?, ?)', [timeLimitId2, profileId, 90])
    ).rejects.toThrow();
  });
});
