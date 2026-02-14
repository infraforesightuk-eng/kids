import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Centralized database service that manages a single SQLite connection
 * and handles schema initialization automatically.
 */
class DatabaseService {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Connect to the database and initialize schema if needed
   */
  async connect() {
    if (this.db) {
      return this.db; // Already connected
    }

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await this.db.run('PRAGMA foreign_keys = ON');

    // Initialize schema
    await this.initializeSchema();

    return this.db;
  }

  /**
   * Initialize database schema from schema.sql file
   */
  async initializeSchema() {
    const schemaPath = join(__dirname, '..', '..', 'db', 'schema.sql');
    const schema = await readFile(schemaPath, 'utf-8');

    // Use exec() to handle multiple statements including triggers
    await this.db.exec(schema);
  }

  /**
   * Get the database connection
   */
  getConnection() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  async disconnect() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Check if database is connected
   */
  isConnected() {
    return this.db !== null;
  }
}

export default DatabaseService;
