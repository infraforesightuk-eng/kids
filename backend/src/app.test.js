import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from './app.js';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

describe('API Integration', () => {
  const dbPath = path.resolve(process.cwd(), 'test-api.db');
  let app;

  beforeAll(async () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    // createApp now handles schema initialization automatically
    app = await createApp(dbPath);
  });

  afterAll(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('should create and retrieve a profile via API', async () => {
    const res = await request(app)
      .post('/api/profiles')
      .send({ name: 'API Child', avatar: 'star' });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('API Child');
    const profileId = res.body.id;

    const getRes = await request(app).get(`/api/profiles/${profileId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('API Child');
  });

  it('should manage whitelist via API', async () => {
    const pRes = await request(app)
      .post('/api/profiles')
      .send({ name: 'Whitelist User' });
    const profileId = pRes.body.id;

    const wRes = await request(app)
      .post(`/api/profiles/${profileId}/whitelist`)
      .send({ tmdbId: '999', mediaType: 'movie' });
    
    expect(wRes.status).toBe(201);
    
    const listRes = await request(app).get(`/api/profiles/${profileId}/whitelist`);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].tmdbId).toBe('999');
  });
});
