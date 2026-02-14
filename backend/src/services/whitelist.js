import { v4 as uuidv4 } from 'uuid';

/**
 * Whitelist service for managing approved content per profile
 * Uses a shared database connection passed via constructor
 */
class WhitelistService {
  constructor(db) {
    this.db = db;
  }

  async addContentToWhitelist(profileId, tmdbId, mediaType) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db.run(
      'INSERT INTO Whitelist (id, profileId, tmdbId, mediaType, addedAt) VALUES (?, ?, ?, ?, ?)',
      [id, profileId, tmdbId, mediaType, now]
    );

    return this.getWhitelistItem(id);
  }

  async getWhitelistItem(id) {
    return await this.db.get('SELECT * FROM Whitelist WHERE id = ?', id);
  }

  async getWhitelistByProfileId(profileId) {
    return await this.db.all('SELECT * FROM Whitelist WHERE profileId = ? ORDER BY addedAt DESC', profileId);
  }

  async removeContentFromWhitelist(profileId, tmdbId, mediaType) {
    await this.db.run(
      'DELETE FROM Whitelist WHERE profileId = ? AND tmdbId = ? AND mediaType = ?',
      [profileId, tmdbId, mediaType]
    );
  }

  async isContentWhitelisted(profileId, tmdbId, mediaType) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM Whitelist WHERE profileId = ? AND tmdbId = ? AND mediaType = ?',
      [profileId, tmdbId, mediaType]
    );
    return result.count > 0;
  }
}

export default WhitelistService;