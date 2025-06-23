# API Contracts Specification

## Backend API Endpoints

### 1. GET /api/feed

Fetches and returns the parsed podcast RSS feed.

**Request:**
```http
GET /api/feed
Accept: application/json
```

**Response (200 OK):**
```json
{
  "feed": {
    "url": "https://feeds.simplecast.com/gvtxUiIf",
    "title": "Hanselminutes with Scott Hanselman",
    "description": "Fresh Air for Developers...",
    "imageUrl": "https://image.simplecastcdn.com/.../artwork.jpg",
    "link": "https://www.hanselminutes.com",
    "language": "en-us",
    "lastBuildDate": "2025-06-12T22:53:25Z",
    "lastFetchDate": "2025-06-23T10:30:00Z",
    "episodes": [
      {
        "guid": "7712e025-1c36-4ddd-a3a9-eafe7e07f13a",
        "title": "Startup Mindsets with Earl Valencia",
        "description": "What does it really take to succeed...",
        "descriptionHtml": "<p>What does it <i>really</i> take...",
        "episodeNumber": 1001,
        "audioUrl": "https://r.zen.ai/r/cdn.simplecast.com/...",
        "audioLength": 31313889,
        "duration": "00:32:31",
        "imageUrl": "https://image.simplecastcdn.com/.../1001.jpg",
        "publishDate": "2025-06-12T21:00:00Z",
        "author": "Scott Hanselman"
      }
    ]
  },
  "cached": false,
  "cacheAge": null
}
```

**Response (503 Service Unavailable):**
```json
{
  "error": "RSS_FEED_UNAVAILABLE",
  "message": "Unable to fetch RSS feed",
  "cached": true,
  "cacheAge": 3600,
  "feed": { /* cached feed data if available */ }
}
```

### 2. GET /api/feed/refresh

Forces a refresh of the RSS feed cache.

**Request:**
```http
GET /api/feed/refresh
Accept: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated": true,
  "newEpisodes": 2,
  "feed": { /* updated feed data */ }
}
```

### 3. GET /api/proxy/audio

Proxies audio files to handle potential CORS issues.

**Request:**
```http
GET /api/proxy/audio?url=https://r.zen.ai/r/cdn.simplecast.com/...
Range: bytes=0-1023
```

**Response (206 Partial Content):**
```http
Content-Type: audio/mpeg
Content-Length: 1024
Content-Range: bytes 0-1023/31313889
Accept-Ranges: bytes

[binary audio data]
```

### 4. GET /api/health

Health check endpoint.

**Request:**
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "cache": {
    "enabled": true,
    "size": 1248576,
    "age": 300
  }
}
```

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
  "details": { /* optional additional context */ }
}
```

### Error Codes
- `RSS_FEED_UNAVAILABLE`: Cannot fetch RSS feed
- `INVALID_AUDIO_URL`: Audio URL validation failed
- `PROXY_ERROR`: Audio proxy request failed
- `CACHE_ERROR`: Cache operation failed
- `PARSE_ERROR`: RSS parsing failed

## CLI Interface Contracts

### Backend CLI

```bash
# Start server
podcast-backend serve --port 3001

# Fetch and display feed
podcast-backend feed --format json

# Clear cache
podcast-backend cache clear

# Show cache status
podcast-backend cache status

# Validate RSS feed
podcast-backend validate --url https://feeds.simplecast.com/gvtxUiIf
```

### Frontend CLI

```bash
# Development server
podcast-player dev --port 3000

# Production build
podcast-player build --output dist/

# Preview production build
podcast-player preview

# Run tests
podcast-player test
```

## Response Headers

### CORS Headers (Backend)
```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Range
Access-Control-Expose-Headers: Content-Range, Content-Length
```

### Cache Headers
```http
Cache-Control: public, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Thu, 12 Jun 2025 22:53:25 GMT
```

## Rate Limiting

Backend implements rate limiting for RSS feed fetches:
- 10 requests per minute per IP
- 100 requests per hour per IP
- Cached responses don't count against limits

## WebSocket Contract (Future Enhancement)

For real-time updates when new episodes are published:

```javascript
// Client → Server
{
  "type": "SUBSCRIBE_FEED_UPDATES",
  "feedUrl": "https://feeds.simplecast.com/gvtxUiIf"
}

// Server → Client
{
  "type": "NEW_EPISODES",
  "episodes": [ /* new episode data */ ],
  "timestamp": "2025-06-23T10:30:00Z"
}
```