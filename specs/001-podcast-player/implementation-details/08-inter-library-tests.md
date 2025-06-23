# Inter-Library Test Specifications

## Library Boundaries

### Libraries in This Implementation
1. **podcast-backend**: RSS fetching, caching, and API server
2. **podcast-player**: React frontend application

### Library Interaction Points
- HTTP API (frontend → backend)
- CLI interfaces (user → libraries)
- Shared data contracts (Episode, Feed types)

## Inter-Library Contract Tests

### 1. Data Contract Compatibility

#### Test: Frontend and backend use compatible Episode types
```typescript
describe('Episode Type Compatibility', () => {
  it('backend Episode matches frontend Episode interface', () => {
    // Backend episode shape
    const backendEpisode = fetchEpisodeFromBackend();
    
    // Frontend episode validator
    const isValidFrontendEpisode = (ep: any): ep is Episode => {
      return (
        typeof ep.guid === 'string' &&
        typeof ep.title === 'string' &&
        typeof ep.audioUrl === 'string' &&
        typeof ep.duration === 'string' &&
        ep.publishDate instanceof Date ||
        typeof ep.publishDate === 'string'
      );
    };
    
    expect(isValidFrontendEpisode(backendEpisode)).toBe(true);
  });
});
```

#### Test: Date serialization compatibility
```javascript
it('dates serialize/deserialize correctly between libraries', () => {
  // Backend sends ISO string
  const backendDate = new Date().toISOString();
  
  // Frontend parses it
  const frontendDate = new Date(backendDate);
  
  // Can round-trip back
  expect(frontendDate.toISOString()).toBe(backendDate);
});
```

### 2. API Communication Tests

#### Test: Frontend handles all backend error codes
```javascript
describe('Error Code Handling', () => {
  const backendErrorCodes = [
    'RSS_FEED_UNAVAILABLE',
    'INVALID_AUDIO_URL',
    'PROXY_ERROR',
    'CACHE_ERROR',
    'PARSE_ERROR'
  ];
  
  backendErrorCodes.forEach(errorCode => {
    it(`frontend handles ${errorCode} appropriately`, async () => {
      // Mock backend to return error
      mockBackendError(errorCode);
      
      // Frontend should handle gracefully
      const { error } = await frontend.fetchFeed();
      expect(error).toBeDefined();
      expect(error.code).toBe(errorCode);
      expect(error.userMessage).toBeTruthy(); // Has user-friendly message
    });
  });
});
```

#### Test: Frontend respects backend rate limits
```javascript
it('frontend implements exponential backoff on rate limit', async () => {
  // Arrange
  let attempts = 0;
  mockBackend.onGet('/api/feed').reply(() => {
    attempts++;
    return [429, { error: 'RATE_LIMITED' }];
  });
  
  // Act
  await frontend.fetchFeedWithRetry();
  
  // Assert
  expect(attempts).toBeLessThanOrEqual(3);
  expect(mockBackend.history.get.map(r => r.timestamp))
    .toHaveExponentialDelays();
});
```

### 3. CLI Interoperability Tests

#### Test: Frontend build works with backend serve
```bash
test_frontend_backend_integration() {
  # Start backend
  podcast-backend serve --port 3001 &
  backend_pid=$!
  
  # Build frontend
  podcast-player build --api-url http://localhost:3001
  
  # Serve frontend
  podcast-player preview --port 3000 &
  frontend_pid=$!
  
  # Test integration
  sleep 3
  response=$(curl -s http://localhost:3000)
  
  # Cleanup
  kill $backend_pid $frontend_pid
  
  # Assert
  [[ $response == *"<div id=\"root\">"* ]]
}
```

### 4. Shared Configuration Tests

#### Test: Environment variable consistency
```javascript
describe('Environment Configuration', () => {
  it('both libraries use same env var names', () => {
    // Backend env vars
    const backendEnv = {
      PORT: process.env.PODCAST_BACKEND_PORT,
      CACHE_TTL: process.env.PODCAST_CACHE_TTL,
    };
    
    // Frontend env vars
    const frontendEnv = {
      API_URL: process.env.VITE_API_URL,
      API_TIMEOUT: process.env.VITE_API_TIMEOUT,
    };
    
    // No conflicts
    const backendKeys = Object.keys(backendEnv);
    const frontendKeys = Object.keys(frontendEnv);
    const intersection = backendKeys.filter(k => frontendKeys.includes(k));
    expect(intersection).toHaveLength(0);
  });
});
```

### 5. Performance Contract Tests

#### Test: Combined system meets performance requirements
```javascript
it('full stack loads episodes within 3 seconds', async () => {
  // Start both services
  await startBackend();
  await startFrontend();
  
  // Measure initial load
  const startTime = Date.now();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('.episode-card');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

### 6. Cache Coordination Tests

#### Test: Frontend respects backend cache headers
```javascript
it('frontend caches based on backend headers', async () => {
  // First request
  const response1 = await fetch('/api/feed');
  const etag = response1.headers.get('ETag');
  
  // Second request with If-None-Match
  const response2 = await fetch('/api/feed', {
    headers: { 'If-None-Match': etag }
  });
  
  expect(response2.status).toBe(304); // Not Modified
});
```

### 7. Build Artifact Tests

#### Test: Frontend build includes all necessary assets
```bash
test_build_completeness() {
  # Build frontend
  podcast-player build
  
  # Check for required files
  required_files=(
    "dist/index.html"
    "dist/assets/*.js"
    "dist/assets/*.css"
  )
  
  for pattern in "${required_files[@]}"; do
    if ! ls $pattern >/dev/null 2>&1; then
      echo "Missing required file: $pattern"
      exit 1
    fi
  done
}
```

## Test Utilities

### Shared Test Helpers
```javascript
// test-utils/library-helpers.js
export async function startFullStack(options = {}) {
  const backend = await startBackend({
    port: options.backendPort || 3001,
    cacheEnabled: options.cache !== false
  });
  
  const frontend = await startFrontend({
    port: options.frontendPort || 3000,
    apiUrl: `http://localhost:${backend.port}`
  });
  
  return { backend, frontend };
}

export async function cleanupFullStack({ backend, frontend }) {
  await frontend.stop();
  await backend.stop();
}
```

## Continuous Integration Tests

### GitHub Actions Workflow
```yaml
name: Inter-Library Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          npm run build:backend
          npm run build:frontend
      
      - name: Run inter-library tests
        run: npm run test:integration
      
      - name: Test CLI compatibility
        run: ./scripts/test-cli-integration.sh
```