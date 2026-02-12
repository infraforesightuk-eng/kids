import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

class ProfileService {
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

  async createProfile(name, avatar, pin = null) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    
    await this.db.run(
      'INSERT INTO Profile (id, name, avatar, pin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, avatar, pin, createdAt, updatedAt]
    );
    
    return { id, name, avatar, pin, createdAt, updatedAt };
  }
}

export default ProfileService;
