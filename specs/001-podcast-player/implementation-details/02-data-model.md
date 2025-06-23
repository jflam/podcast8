# Data Model Specification

## Core Entities

### Episode
Represents a single podcast episode from the RSS feed.

```typescript
interface Episode {
  // Primary identifier from RSS
  guid: string;
  
  // Display information
  title: string;
  description: string;        // Plain text summary
  descriptionHtml: string;     // Full HTML content
  episodeNumber: number;       // Sequential episode number
  
  // Media information
  audioUrl: string;           // MP3 file URL
  audioLength: number;        // File size in bytes
  duration: string;           // Format: "HH:MM:SS"
  imageUrl: string;           // Episode artwork URL
  
  // Metadata
  publishDate: Date;          // Publication timestamp
  author: string;             // Episode author
  
  // Client-side state
  lastPlayed?: Date;          // For tracking new episodes
  playbackPosition?: number;  // Seconds for resume functionality
}
```

### Feed
Represents the podcast feed metadata.

```typescript
interface Feed {
  // Feed identification
  url: string;                // Current RSS feed URL
  
  // Podcast information
  title: string;              // Podcast name
  description: string;        // Podcast description
  imageUrl: string;           // Podcast artwork
  link: string;               // Podcast website
  language: string;           // Content language
  
  // Feed metadata
  lastBuildDate: Date;        // Last RSS update
  lastFetchDate: Date;        // Last local fetch
  
  // Episodes
  episodes: Episode[];        // All episodes in feed
}
```

### Cache
Manages feed caching for offline access.

```typescript
interface Cache {
  // Cache metadata
  version: string;            // Cache format version
  createdAt: Date;           // Cache creation time
  expiresAt: Date;           // Cache expiration
  
  // Cached data
  feed: Feed;                // Complete feed data
  
  // Cache control
  etag?: string;             // HTTP ETag for conditional requests
  lastModified?: string;     // HTTP Last-Modified header
}
```

## State Management

### Application State
```typescript
interface AppState {
  // Feed data
  feed: Feed | null;
  isLoading: boolean;
  error: string | null;
  
  // UI state
  selectedEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;        // Playback position in seconds
  
  // Filter/sort state
  sortOrder: 'newest' | 'oldest';
  searchQuery: string;
}
```

### Playback State
```typescript
interface PlaybackState {
  episodeGuid: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;             // 0-1
  playbackRate: number;       // 1.0 = normal speed
}
```

## Data Transformation

### RSS to Episode Mapping
```
RSS <item> → Episode:
- guid → guid
- title → title
- description → description (strip HTML)
- content:encoded → descriptionHtml
- pubDate → publishDate (parse RFC 2822)
- enclosure.url → audioUrl
- enclosure.length → audioLength
- itunes:duration → duration
- itunes:image.href → imageUrl
- itunes:episode → episodeNumber
- author → author
```

### RSS to Feed Mapping
```
RSS <channel> → Feed:
- link → url
- title → title
- description → description
- image.url → imageUrl
- link → link
- language → language
- lastBuildDate → lastBuildDate
- items → episodes[]
```

## Validation Rules

### Episode Validation
- guid: Required, must be unique
- title: Required, non-empty string
- audioUrl: Required, valid URL starting with https://
- publishDate: Required, valid date
- duration: Required, format HH:MM:SS or MM:SS

### Feed Validation
- url: Required, valid URL
- title: Required, non-empty string
- episodes: Array, can be empty
- lastBuildDate: Required, valid date

## Storage Considerations

### Local Storage
- Cache feed data in localStorage/IndexedDB
- Key: 'podcast-feed-cache'
- Size limit: ~5-10MB (localStorage)
- Compression: Consider LZ-string for large feeds

### Session Storage
- Current playback state
- UI preferences (sort order, volume)
- Key: 'podcast-playback-state'

## Performance Optimizations

### Lazy Loading
- Load episode descriptions on demand
- Defer loading of descriptionHtml until detail view

### Indexing
- Create Map by guid for O(1) episode lookup
- Pre-sort episodes by date on cache write

### Memory Management
- Limit cached episodes to most recent 100
- Clear old playback positions after 30 days