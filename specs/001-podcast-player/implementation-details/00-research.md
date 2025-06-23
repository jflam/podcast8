# Research: RSS Feed Analysis and CORS Handling

## RSS Feed Structure Analysis

### Feed Location
- Initial URL: `https://hanselminutes.com/subscribe`
- Redirects to: `https://feeds.simplecast.com/gvtxUiIf`

### Image Locations in RSS Feed

Based on analysis of the actual RSS feed, images are stored in two locations:

1. **Channel-level image** (podcast artwork):
   ```xml
   <channel>
     <image>
       <url>https://image.simplecastcdn.com/images/[guid]/3000x3000/1519419781artwork.jpg?aid=rss_feed</url>
     </image>
     <itunes:image href="https://image.simplecastcdn.com/images/[guid]/3000x3000/1519419781artwork.jpg?aid=rss_feed"/>
   </channel>
   ```

2. **Episode-level images** (individual episode artwork):
   ```xml
   <item>
     <itunes:image href="https://image.simplecastcdn.com/images/[guid]/3000x3000/[episode-number].jpg?aid=rss_feed"/>
   </item>
   ```

### Key RSS Elements per Episode

Each episode (`<item>`) contains:
- `<guid>`: Unique identifier
- `<title>`: Episode title
- `<description>`: HTML-encoded summary
- `<content:encoded>`: Full HTML description
- `<pubDate>`: Publication date in RFC 2822 format
- `<enclosure>`: Audio file URL with length and type
- `<itunes:duration>`: Duration in HH:MM:SS format
- `<itunes:episode>`: Episode number
- `<itunes:image>`: Episode-specific artwork URL

### Audio File URLs

Audio files are hosted on:
- Primary CDN: `https://r.zen.ai/r/cdn.simplecast.com/audio/[path]`
- Format: MP3
- Includes query parameters for tracking

## CORS Considerations

### Expected CORS Issues

1. **RSS Feed Access**: Direct browser fetch to `feeds.simplecast.com` will likely fail due to CORS
2. **Audio Streaming**: Audio URLs may have CORS restrictions
3. **Image Loading**: Image URLs should work (images typically don't have CORS restrictions)

### Solution: Backend Proxy

A backend service is required to:
1. Fetch RSS feed data (bypassing CORS)
2. Parse and cache the RSS content
3. Potentially proxy audio streams if CORS issues occur
4. Handle RSS feed redirects server-side

## Performance Considerations

### RSS Feed Size
- Feed contains full episode history (potentially hundreds of episodes)
- Each episode includes full HTML description (can be several KB)
- Total feed size can be several MB

### Caching Strategy
1. Cache parsed RSS data with TTL
2. Store episode metadata in structured format
3. Implement incremental updates (check for new episodes only)
4. Consider pagination for initial load

## React Scaffolding Options

### Recommended: Vite + React
- Fast development server
- Built-in TypeScript support
- Minimal configuration
- Production-ready build process

### Alternative: Create React App
- Well-established tooling
- Extensive documentation
- Slower development builds
- Less modern than Vite

## Backend Technology Options

### For CORS Proxy and Caching:
1. **Node.js + Express**: Simple, same language as frontend
2. **Node.js + Fastify**: Higher performance alternative
3. **Deno**: Modern runtime with better security defaults

### Caching Options:
1. **In-memory**: Simple for development
2. **Redis**: For production scalability
3. **File-based**: Simple persistence without external dependencies