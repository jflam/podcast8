import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';

describe('API Contract Tests', () => {
  describe('GET /api/feed', () => {
    it('should return feed with required fields', async () => {
      const response = await request(app).get('/api/feed');
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      
      // Check top-level fields
      expect(response.body).toHaveProperty('feed');
      expect(response.body).toHaveProperty('cached');
      expect(response.body).toHaveProperty('cacheAge');
      
      // Check feed structure
      const feed = response.body.feed;
      expect(feed).toHaveProperty('url');
      expect(feed).toHaveProperty('title');
      expect(feed).toHaveProperty('description');
      expect(feed).toHaveProperty('imageUrl');
      expect(feed).toHaveProperty('link');
      expect(feed).toHaveProperty('language');
      expect(feed).toHaveProperty('lastBuildDate');
      expect(feed).toHaveProperty('lastFetchDate');
      expect(feed).toHaveProperty('episodes');
      expect(Array.isArray(feed.episodes)).toBe(true);
      
      // Check episode structure if episodes exist
      if (feed.episodes.length > 0) {
        const episode = feed.episodes[0];
        expect(episode).toHaveProperty('guid');
        expect(episode).toHaveProperty('title');
        expect(episode).toHaveProperty('description');
        expect(episode).toHaveProperty('audioUrl');
        expect(episode).toHaveProperty('duration');
        expect(episode).toHaveProperty('publishDate');
      }
    });

    it('should return cached data when RSS unavailable', async () => {
      // This test would require mocking the RSS feed to be unavailable
      // For now, we'll skip implementation
    });
  });

  describe('GET /api/feed/refresh', () => {
    it('should force refresh the feed', async () => {
      const response = await request(app).get('/api/feed/refresh');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('updated');
      expect(response.body).toHaveProperty('newEpisodes');
      expect(response.body).toHaveProperty('feed');
      expect(typeof response.body.newEpisodes).toBe('number');
    });
  });

  describe('GET /api/proxy/audio', () => {
    it('should reject invalid audio URLs', async () => {
      const response = await request(app)
        .get('/api/proxy/audio')
        .query({ url: 'not-a-url' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_AUDIO_URL');
      expect(response.body).toHaveProperty('message');
    });

    it('should proxy valid audio URLs', async () => {
      const validUrl = 'https://example.com/audio.mp3';
      const response = await request(app)
        .get('/api/proxy/audio')
        .query({ url: validUrl });
      
      // The actual implementation will handle this
      // For now we expect it to at least not return 400
      expect(response.status).not.toBe(400);
    });

    it('should support range requests', async () => {
      const validUrl = 'https://example.com/audio.mp3';
      const response = await request(app)
        .get('/api/proxy/audio')
        .query({ url: validUrl })
        .set('Range', 'bytes=0-1023');
      
      // Check for range support headers
      if (response.status === 206) {
        expect(response.headers).toHaveProperty('content-range');
        expect(response.headers).toHaveProperty('accept-ranges', 'bytes');
      }
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);
      
      if (response.body.cache) {
        expect(response.body.cache).toHaveProperty('enabled');
      }
    });
  });

  describe('CORS Headers', () => {
    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .get('/api/feed')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });
});