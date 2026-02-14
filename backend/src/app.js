import express from 'express';
import DatabaseService from './services/database.js';
import ProfileService from './services/profile.js';
import WhitelistService from './services/whitelist.js';

const createApp = async (dbPath) => {
  const app = express();
  app.use(express.json());

  // Initialize database connection
  const dbService = new DatabaseService(dbPath);
  await dbService.connect();
  const db = dbService.getConnection();

  // Initialize services with shared database connection
  const profileService = new ProfileService(db);
  const whitelistService = new WhitelistService(db);

  // Attach services to request object
  app.use((req, res, next) => {
    req.db = db;
    req.profileService = profileService;
    req.whitelistService = whitelistService;
    next();
  });

  // Profiles API
  app.get('/api/profiles', async (req, res) => {
    try {
      const profiles = await req.profileService.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/profiles', async (req, res) => {
    try {
      const { name, avatar, pin } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const profile = await req.profileService.createProfile(name, avatar, pin);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/profiles/:id', async (req, res) => {
    try {
      const profile = await req.profileService.getProfileById(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/profiles/:id', async (req, res) => {
    try {
      const { name, avatar, pin } = req.body;
      const profile = await req.profileService.updateProfile(req.params.id, name, avatar, pin);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/profiles/:id', async (req, res) => {
    try {
      await req.profileService.deleteProfile(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Whitelist API
  app.post('/api/profiles/:id/whitelist', async (req, res) => {
    try {
      const { tmdbId, mediaType } = req.body;
      if (!tmdbId || !mediaType) return res.status(400).json({ error: 'tmdbId and mediaType are required' });
      const item = await req.whitelistService.addContentToWhitelist(req.params.id, tmdbId, mediaType);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/profiles/:id/whitelist', async (req, res) => {
    try {
      const whitelist = await req.whitelistService.getWhitelistByProfileId(req.params.id);
      res.json(whitelist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/profiles/:id/whitelist', async (req, res) => {
    try {
      const { tmdbId, mediaType } = req.body;
      await req.whitelistService.removeContentFromWhitelist(req.params.id, tmdbId, mediaType);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
};

export default createApp;
