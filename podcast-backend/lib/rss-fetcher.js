import Parser from 'rss-parser';
import NodeCache from 'node-cache';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:image', 'itunesImage', { keepArray: false }],
      ['itunes:duration', 'itunesDuration'],
      ['itunes:episode', 'itunesEpisode'],
      ['content:encoded', 'contentEncoded']
    ],
    feed: [
      ['itunes:image', 'itunesImage', { keepArray: false }]
    ]
  }
});

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

const FEED_URL = 'https://feeds.simplecast.com/gvtxUiIf';
const CACHE_KEY = 'podcast-feed';

export async function fetchFeed(url = FEED_URL, forceCache = false) {
  // Check cache first
  const cached = cache.get(CACHE_KEY);
  if (cached || forceCache) {
    const cacheAge = cache.getTtl(CACHE_KEY);
    const age = cacheAge ? Math.floor((cacheAge - Date.now()) / 1000) : null;
    return {
      feed: cached || null,
      cached: true,
      cacheAge: age,
      previousEpisodeCount: cached ? cached.episodes.length : 0
    };
  }

  try {
    // Fetch and parse RSS feed
    const feed = await parser.parseURL(url);
    
    // Transform to our format
    // Handle feed-level image
    let feedImageUrl = '';
    if (feed.itunesImage) {
      if (typeof feed.itunesImage === 'string') {
        feedImageUrl = feed.itunesImage;
      } else if (feed.itunesImage.$ && feed.itunesImage.$.href) {
        feedImageUrl = feed.itunesImage.$.href;
      } else if (feed.itunesImage.href) {
        feedImageUrl = feed.itunesImage.href;
      }
    }
    if (!feedImageUrl && feed.image?.url) {
      feedImageUrl = feed.image.url;
    }
    
    const transformedFeed = {
      url: url,
      title: feed.title || '',
      description: feed.description || '',
      imageUrl: feedImageUrl,
      link: feed.link || '',
      language: feed.language || 'en',
      lastBuildDate: feed.lastBuildDate || new Date().toISOString(),
      lastFetchDate: new Date().toISOString(),
      episodes: (feed.items || []).map((item, index) => {
        // Debug first episode to see structure
        if (index === 0) {
          console.log('First episode structure:', {
            hasItunesImage: !!item.itunesImage,
            itunesImage: item.itunesImage,
            hasEnclosure: !!item.enclosure,
            allKeys: Object.keys(item)
          });
        }
        
        // Handle different image property structures
        let imageUrl = '';
        if (item.itunesImage) {
          if (typeof item.itunesImage === 'string') {
            imageUrl = item.itunesImage;
          } else if (item.itunesImage.$ && item.itunesImage.$.href) {
            imageUrl = item.itunesImage.$.href;
          } else if (item.itunesImage.href) {
            imageUrl = item.itunesImage.href;
          }
        }
        if (!imageUrl && feed.itunesImage) {
          if (typeof feed.itunesImage === 'string') {
            imageUrl = feed.itunesImage;
          } else if (feed.itunesImage.$ && feed.itunesImage.$.href) {
            imageUrl = feed.itunesImage.$.href;
          } else if (feed.itunesImage.href) {
            imageUrl = feed.itunesImage.href;
          }
        }
        
        return {
          guid: item.guid || item.link || '',
          title: item.title || '',
          description: stripHtml(item.description || item.contentSnippet || ''),
          descriptionHtml: item.contentEncoded || item.content || item.description || '',
          episodeNumber: parseInt(item.itunesEpisode) || null,
          audioUrl: item.enclosure?.url || '',
          audioLength: parseInt(item.enclosure?.length) || 0,
          duration: item.itunesDuration || '00:00',
          imageUrl: imageUrl,
          publishDate: item.pubDate || new Date().toISOString(),
          author: item.creator || item['dc:creator'] || feed.title || ''
        };
      })
    };

    // Cache the result
    cache.set(CACHE_KEY, transformedFeed);

    return {
      feed: transformedFeed,
      cached: false,
      cacheAge: null
    };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
}

export function clearCache() {
  cache.del(CACHE_KEY);
}

export function getCacheStatus() {
  const keys = cache.keys();
  const stats = cache.getStats();
  
  return {
    size: keys.length,
    hits: stats.hits,
    misses: stats.misses,
    keys: keys,
    age: cache.getTtl(CACHE_KEY) ? Math.floor((cache.getTtl(CACHE_KEY) - Date.now()) / 1000) : null
  };
}

// Helper function to strip HTML tags
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}