# Podcast Player

A unified podcast player application with React frontend and Node.js backend.

## Quick Start

### Installation
```bash
npm install
```

### Development
Start both frontend and backend with unified logging:
```bash
npm run dev
```

This will:
- Start the backend server on http://localhost:3001
- Start the frontend dev server on http://localhost:3000
- Display unified logs from both services with color-coded prefixes
- Capture and display frontend console logs in the terminal

### Testing
Run all tests:
```bash
npm run test
```

Run frontend tests only:
```bash
npm run test:player
```

Run backend tests only:
```bash
npm run test:backend
```

## Features

### Unified Development Environment
- Single command to start both frontend and backend
- Consolidated logging with clear service identification
- Frontend console logs captured and displayed in terminal
- Color-coded output for easy debugging

### Frontend (podcast-player)
- React 19 application
- Vite for fast development and building
- Console log capture plugin for unified logging

### Backend (podcast-backend)
- Express.js API server
- RSS feed fetching with caching
- CORS support for frontend integration

## Project Structure
```
podcast8/
├── podcast-player/     # Frontend React application
├── podcast-backend/    # Backend API server
├── specs/             # Feature specifications
└── contracts/         # API contracts
```