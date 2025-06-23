import express from 'express';
import cors from 'cors';
import { fetchFeed, clearCache, getCacheStatus } from './lib/rss-fetcher.js';
import { proxyAudio } from './lib/proxy.js';

export const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range'],
  exposedHeaders: ['Content-Range', 'Content-Length'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const cacheStatus = getCacheStatus();
  res.json({
    status: 'healthy',
    version: '1.0.0',
    cache: {
      enabled: true,
      size: cacheStatus.size || 0,
      age: cacheStatus.age || 0
    }
  });
});

// Get feed endpoint
app.get('/api/feed', async (req, res) => {
  try {
    const result = await fetchFeed();
    res.json({
      feed: result.feed,
      cached: result.cached,
      cacheAge: result.cacheAge
    });
  } catch (error) {
    // If we have cached data, return it with 503 status
    const cachedResult = await fetchFeed(null, true); // Force cache
    if (cachedResult && cachedResult.feed) {
      res.status(503).json({
        error: 'RSS_FEED_UNAVAILABLE',
        message: 'Unable to fetch RSS feed',
        cached: true,
        cacheAge: cachedResult.cacheAge,
        feed: cachedResult.feed
      });
    } else {
      res.status(503).json({
        error: 'RSS_FEED_UNAVAILABLE',
        message: 'Unable to fetch RSS feed and no cache available',
        cached: false,
        cacheAge: null
      });
    }
  }
});

// Refresh feed endpoint
app.get('/api/feed/refresh', async (req, res) => {
  try {
    clearCache(); // Clear cache to force refresh
    const result = await fetchFeed();
    const previousCount = result.previousEpisodeCount || 0;
    const newCount = result.feed.episodes.length;
    
    res.json({
      success: true,
      updated: true,
      newEpisodes: Math.max(0, newCount - previousCount),
      feed: result.feed
    });
  } catch (error) {
    res.status(500).json({
      error: 'CACHE_ERROR',
      message: 'Failed to refresh feed',
      details: { error: error.message }
    });
  }
});

// Audio proxy endpoint
app.get('/api/proxy/audio', async (req, res) => {
  const { url } = req.query;
  
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      error: 'INVALID_AUDIO_URL',
      message: 'Invalid or missing audio URL'
    });
  }
  
  try {
    await proxyAudio(url, req, res);
  } catch (error) {
    res.status(500).json({
      error: 'PROXY_ERROR',
      message: 'Failed to proxy audio',
      details: { error: error.message }
    });
  }
});

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function createServer() {
  return app;
}