import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

class WhitelistService {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database,
    });
  }

  async disconnect() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async addContentToWhitelist(profileId, tmdbId, mediaType) {
    const id = uuidv4();
    const addedAt = new Date().toISOString();

    await this.db.run(
      'INSERT INTO Whitelist (id, profileId, tmdbId, mediaType, addedAt) VALUES (?, ?, ?, ?, ?)',
      [id, profileId, tmdbId, mediaType, addedAt]
    );

    return { id, profileId, tmdbId, mediaType, addedAt };
  }

  async getWhitelistByProfileId(profileId) {
    const whitelist = await this.db.all('SELECT * FROM Whitelist WHERE profileId = ?', profileId);
    return whitelist;
  }

  async removeContentFromWhitelist(profileId, tmdbId, mediaType) {
    await this.db.run(
      'DELETE FROM Whitelist WHERE profileId = ? AND tmdbId = ? AND mediaType = ?',
      [profileId, tmdbId, mediaType]
    );
  }
}

export default WhitelistService;