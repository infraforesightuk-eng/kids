import { v4 as uuidv4 } from 'uuid';

/**
 * Profile service for managing child profiles
 * Uses a shared database connection passed via constructor
 */
class ProfileService {
  constructor(db) {
    this.db = db;
  }

  async createProfile(name, avatar, pin = null) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db.run(
      'INSERT INTO Profile (id, name, avatar, pin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, avatar, pin, now, now]
    );

    return this.getProfileById(id);
  }

  async getProfileById(id) {
    return await this.db.get('SELECT * FROM Profile WHERE id = ?', id);
  }

  async getAllProfiles() {
    return await this.db.all('SELECT * FROM Profile ORDER BY createdAt DESC');
  }

  async updateProfile(id, name, avatar, pin = null) {
    const now = new Date().toISOString();
    await this.db.run(
      'UPDATE Profile SET name = ?, avatar = ?, pin = ?, updatedAt = ? WHERE id = ?',
      [name, avatar, pin, now, id]
    );
    return this.getProfileById(id);
  }

  async deleteProfile(id) {
    await this.db.run('DELETE FROM Profile WHERE id = ?', id);
  }
}

export default ProfileService;
