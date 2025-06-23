# Manual Testing Guide

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- Terminal/command prompt access
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Initial Setup

1. **Clone and navigate to project:**
   ```bash
   cd specs/001-podcast-player
   ```

2. **Install backend dependencies:**
   ```bash
   cd podcast-backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies:**
   ```bash
   cd podcast-player
   npm install
   cd ..
   ```

### Starting the Application

1. **Start the backend server:**
   ```bash
   cd podcast-backend
   npm run serve
   # or
   node cli.js serve --port 3001
   ```
   Expected output:
   ```
   Podcast backend server listening on port 3001
   Cache initialized
   CORS enabled for http://localhost:3000
   ```

2. **Start the frontend development server:**
   ```bash
   # In a new terminal
   cd podcast-player
   npm run dev
   # or
   npx vite dev --port 3000
   ```
   Expected output:
   ```
   VITE ready in X ms
   ➜  Local:   http://localhost:3000/
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## User Story Validation

### US-001: View All Available Podcast Episodes

**Test Steps:**
1. Open http://localhost:3000 in your browser
2. Wait for the page to fully load

**Expected Results:**
- [ ] Page loads within 3 seconds
- [ ] Episode cards are displayed in a grid or list layout
- [ ] Each card shows:
  - [ ] Episode title
  - [ ] Episode image (unique per episode)
  - [ ] Publication date
  - [ ] Episode number (if available)
- [ ] Episodes are sorted by date (newest first)
- [ ] No loading errors displayed

**Edge Case - RSS Feed Unavailable:**
1. Stop the backend server (Ctrl+C)
2. Modify backend to simulate RSS failure
3. Restart backend
4. Refresh the browser

**Expected Results:**
- [ ] Cached episodes display (if previously loaded)
- [ ] "Offline mode" or similar indicator shown
- [ ] No error crashes the application

### US-002: Click Episode Card to View Details

**Test Steps:**
1. From the main page with episodes displayed
2. Click on any episode card

**Expected Results:**
- [ ] Navigation to detail page occurs smoothly
- [ ] Detail page shows:
  - [ ] Episode title (larger/prominent)
  - [ ] Full episode description
  - [ ] Episode image
  - [ ] Audio player controls
  - [ ] Publication date
  - [ ] Episode duration
- [ ] Back/return navigation available
- [ ] URL changes to reflect current episode

**Edge Case - Invalid Episode Data:**
1. Navigate directly to a non-existent episode URL (e.g., `/episode/invalid-id`)

**Expected Results:**
- [ ] Error message displayed (not a crash)
- [ ] Option to return to episode list
- [ ] Application remains functional

### US-003: Play Podcast Episodes

**Test Steps:**
1. Navigate to any episode detail page
2. Locate the audio player
3. Click the play button

**Expected Results:**
- [ ] Audio begins playing within 2 seconds
- [ ] Play button changes to pause button
- [ ] Progress bar shows current position
- [ ] Time display shows current time / total duration
- [ ] Audio is audible through speakers/headphones

**Additional Player Tests:**
1. **Pause:** Click pause button
   - [ ] Audio stops
   - [ ] Position is maintained
   
2. **Seek:** Click or drag on progress bar
   - [ ] Audio jumps to new position
   - [ ] Playback continues from new position
   
3. **Volume:** Adjust volume control
   - [ ] Audio volume changes accordingly
   - [ ] Volume setting persists

**Edge Case - Audio File Unavailable:**
1. Find an episode and modify the network to block audio URLs
2. Try to play the episode

**Expected Results:**
- [ ] Error message appears
- [ ] Retry option available
- [ ] Player doesn't crash
- [ ] Can navigate to other episodes

### US-004: Quick Loading with Cached Data

**Test Steps:**
1. Load the application and browse episodes
2. Close the browser completely
3. Reopen browser and navigate to http://localhost:3000

**Expected Results:**
- [ ] Episodes display within 2 seconds
- [ ] Cached data loads immediately
- [ ] Background refresh indicator (if implemented)
- [ ] No blank screen while waiting for RSS

**Verification:**
1. Check browser developer tools → Network tab
2. Initial load should use cached data
3. Background request for fresh RSS feed

### US-005: New Episode Highlighting

**Test Steps:**
1. Note the current episodes displayed
2. Wait for a new episode to be published (or simulate by modifying RSS)
3. Refresh the application

**Expected Results:**
- [ ] New episodes appear at the top
- [ ] Visual indicator on new episodes (badge, color, "NEW" label)
- [ ] Indicator persists until episode is viewed
- [ ] Previously viewed episodes don't show indicator

## Performance Testing

### Page Load Performance
1. Clear browser cache (Developer Tools → Application → Clear Storage)
2. Measure initial load time:
   - Open Developer Tools → Network tab
   - Navigate to http://localhost:3000
   - Note the total load time

**Success Criteria:**
- [ ] Page interactive within 3 seconds
- [ ] All episode cards visible within 3 seconds

### Audio Playback Performance
1. Navigate to any episode
2. Note the time when clicking play
3. Note when audio actually starts

**Success Criteria:**
- [ ] Audio starts within 2 seconds of clicking play
- [ ] No stuttering or buffering on stable connection

## Error Handling Verification

### Network Errors
1. **Test offline mode:**
   - Load the app successfully once
   - Disconnect from network
   - Try to refresh
   - Expected: Cached content displays

2. **Test server errors:**
   - Stop backend server
   - Try to load fresh content
   - Expected: Graceful error message

### Data Errors
1. **Corrupt cache:**
   - Clear browser storage
   - Manually add invalid data to localStorage
   - Reload app
   - Expected: App recovers and fetches fresh data

## Cross-Browser Testing

Test the application in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Edge

For each browser, verify:
- [ ] Episodes display correctly
- [ ] Audio playback works
- [ ] No console errors
- [ ] Responsive design works

## Accessibility Testing

### Keyboard Navigation
1. Put away your mouse
2. Use only keyboard to:
   - [ ] Tab through episode cards
   - [ ] Enter to select episode
   - [ ] Tab to player controls
   - [ ] Space to play/pause
   - [ ] Arrow keys for volume/seek

### Screen Reader Testing
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Verify:
   - [ ] Episode titles are announced
   - [ ] Player state changes announced
   - [ ] Navigation is logical

## Build and Production Testing

### Production Build
1. **Build frontend:**
   ```bash
   cd podcast-player
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Verify:**
   - [ ] Build completes without errors
   - [ ] Preview shows same functionality
   - [ ] Performance is same or better

## CLI Testing

### Backend CLI
```bash
# Test feed command
podcast-backend feed --format json
# Should output JSON feed data

# Test cache commands
podcast-backend cache status
podcast-backend cache clear

# Test help
podcast-backend --help
```

### Frontend CLI
```bash
# Test build
podcast-player build --output dist/

# Test with custom API URL
podcast-player dev --api-url http://localhost:3001
```

## Checklist Summary

### Core Functionality
- [ ] Episodes load and display
- [ ] Episode details accessible
- [ ] Audio playback works
- [ ] Caching improves performance
- [ ] New episodes highlighted

### Error Handling
- [ ] Offline mode works
- [ ] Server errors handled gracefully
- [ ] Invalid data doesn't crash app

### Performance
- [ ] 3-second page load achieved
- [ ] 2-second audio start achieved
- [ ] Smooth UI interactions

### Quality
- [ ] Cross-browser compatible
- [ ] Keyboard accessible
- [ ] Production build works

## Issue Reporting

If any test fails, document:
1. Test case that failed
2. Expected behavior
3. Actual behavior
4. Browser/environment
5. Console errors (if any)
6. Network errors (if any)
7. Steps to reproduce