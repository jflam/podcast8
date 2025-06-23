# Contract Test Specifications

## API Contract Tests

### 1. Feed Endpoint Contract Tests

#### Test: GET /api/feed returns valid feed structure
```javascript
describe('GET /api/feed', () => {
  it('should return feed with required fields', async () => {
    // Arrange
    const expectedFields = ['feed', 'cached', 'cacheAge'];
    const feedFields = ['url', 'title', 'description', 'imageUrl', 
                       'link', 'language', 'lastBuildDate', 
                       'lastFetchDate', 'episodes'];
    const episodeFields = ['guid', 'title', 'description', 
                          'audioUrl', 'duration', 'publishDate'];
    
    // Act
    const response = await fetch('/api/feed');
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveAllFields(expectedFields);
    expect(data.feed).toHaveAllFields(feedFields);
    expect(data.feed.episodes[0]).toHaveAllFields(episodeFields);
  });
});
```

#### Test: Feed endpoint handles RSS unavailability
```javascript
it('should return cached data when RSS unavailable', async () => {
  // Arrange: Mock RSS feed to be unavailable
  
  // Act
  const response = await fetch('/api/feed');
  const data = await response.json();
  
  // Assert
  expect(response.status).toBe(503);
  expect(data.error).toBe('RSS_FEED_UNAVAILABLE');
  expect(data.cached).toBe(true);
  expect(data.feed).toBeDefined(); // Should have cached data
});
```

### 2. Audio Proxy Contract Tests

#### Test: Audio proxy handles range requests
```javascript
describe('GET /api/proxy/audio', () => {
  it('should support range requests', async () => {
    // Arrange
    const audioUrl = 'https://example.com/audio.mp3';
    const headers = { 'Range': 'bytes=0-1023' };
    
    // Act
    const response = await fetch(
      `/api/proxy/audio?url=${encodeURIComponent(audioUrl)}`,
      { headers }
    );
    
    // Assert
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toMatch(/bytes 0-1023\/\d+/);
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
  });
});
```

#### Test: Audio proxy validates URLs
```javascript
it('should reject invalid audio URLs', async () => {
  // Arrange
  const invalidUrl = 'not-a-url';
  
  // Act
  const response = await fetch(
    `/api/proxy/audio?url=${encodeURIComponent(invalidUrl)}`
  );
  const data = await response.json();
  
  // Assert
  expect(response.status).toBe(400);
  expect(data.error).toBe('INVALID_AUDIO_URL');
});
```

### 3. Health Check Contract Tests

#### Test: Health endpoint returns expected structure
```javascript
describe('GET /api/health', () => {
  it('should return health status', async () => {
    // Act
    const response = await fetch('/api/health');
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(data.cache).toHaveProperty('enabled');
  });
});
```

## CLI Contract Tests

### Backend CLI Tests

#### Test: Feed command outputs valid JSON
```bash
test_feed_json_output() {
  # Act
  output=$(podcast-backend feed --format json)
  
  # Assert
  echo "$output" | jq empty # Valid JSON
  echo "$output" | jq '.feed.episodes | length' # Has episodes
}
```

#### Test: Server starts on specified port
```bash
test_server_port() {
  # Arrange
  port=3001
  
  # Act
  podcast-backend serve --port $port &
  pid=$!
  sleep 2
  
  # Assert
  curl -f http://localhost:$port/api/health
  result=$?
  
  # Cleanup
  kill $pid
  
  # Check
  [ $result -eq 0 ]
}
```

### Frontend CLI Tests

#### Test: Build produces output files
```bash
test_build_output() {
  # Act
  podcast-player build --output dist/
  
  # Assert
  [ -f dist/index.html ]
  [ -d dist/assets ]
  [ -f dist/assets/*.js ]
  [ -f dist/assets/*.css ]
}
```

## Integration Contract Tests

### Frontend-Backend Integration

#### Test: Frontend can fetch and display episodes
```javascript
describe('Frontend-Backend Integration', () => {
  it('should load and display episodes', async () => {
    // Arrange
    await startBackend();
    await startFrontend();
    
    // Act
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.episode-card');
    
    // Assert
    const episodes = await page.$$('.episode-card');
    expect(episodes.length).toBeGreaterThan(0);
    
    const firstEpisode = await page.$('.episode-card:first-child');
    const title = await firstEpisode.$eval('.episode-title', el => el.textContent);
    expect(title).toBeTruthy();
  });
});
```

#### Test: Audio playback integration
```javascript
it('should play audio through proxy', async () => {
  // Arrange
  await page.goto('http://localhost:3000');
  await page.click('.episode-card:first-child');
  
  // Act
  await page.click('.play-button');
  await page.waitForTimeout(1000);
  
  // Assert
  const isPlaying = await page.$eval('audio', el => !el.paused);
  expect(isPlaying).toBe(true);
  
  const audioSrc = await page.$eval('audio', el => el.src);
  expect(audioSrc).toContain('/api/proxy/audio');
});
```

## Error Scenario Tests

### Network Failure Tests
- RSS feed timeout
- Audio proxy network error
- Partial response handling

### Data Validation Tests
- Malformed RSS data
- Missing required fields
- Invalid date formats
- Corrupted cache data

### Performance Contract Tests
- Feed loads within 3 seconds
- Audio starts within 2 seconds
- Cache improves subsequent load times

## Test Data

### Mock RSS Feed
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Podcast</title>
    <description>Test Description</description>
    <link>https://example.com</link>
    <item>
      <guid>test-guid-001</guid>
      <title>Test Episode</title>
      <description>Test episode description</description>
      <enclosure url="https://example.com/test.mp3" 
                 type="audio/mpeg" 
                 length="1000000"/>
      <pubDate>Thu, 01 Jun 2025 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```