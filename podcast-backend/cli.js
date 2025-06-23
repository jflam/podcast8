#!/usr/bin/env node
import { program } from 'commander';
import { createServer } from './server.js';
import { fetchFeed, clearCache, getCacheStatus } from './lib/rss-fetcher.js';

program
  .name('podcast-backend')
  .description('CLI for podcast backend server')
  .version('1.0.0');

program
  .command('serve')
  .description('Start the backend server')
  .option('-p, --port <port>', 'port to listen on', '3001')
  .action((options) => {
    const port = parseInt(options.port);
    const server = createServer();
    server.listen(port, () => {
      console.log(`Podcast backend server listening on port ${port}`);
      console.log('Cache initialized');
      console.log(`CORS enabled for http://localhost:3000`);
    });
  });

program
  .command('feed')
  .description('Fetch and display the RSS feed')
  .option('-f, --format <format>', 'output format', 'json')
  .action(async (options) => {
    try {
      const feed = await fetchFeed();
      if (options.format === 'json') {
        console.log(JSON.stringify(feed, null, 2));
      } else {
        console.log(`Feed: ${feed.title}`);
        console.log(`Episodes: ${feed.episodes.length}`);
      }
    } catch (error) {
      console.error('Error fetching feed:', error.message);
      process.exit(1);
    }
  });

program
  .command('cache')
  .description('Manage cache')
  .argument('<action>', 'clear or status')
  .action((action) => {
    if (action === 'clear') {
      clearCache();
      console.log('Cache cleared');
    } else if (action === 'status') {
      const status = getCacheStatus();
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.error('Invalid action. Use "clear" or "status"');
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate an RSS feed URL')
  .option('-u, --url <url>', 'RSS feed URL to validate')
  .action(async (options) => {
    if (!options.url) {
      console.error('URL is required');
      process.exit(1);
    }
    try {
      const feed = await fetchFeed(options.url);
      console.log('✓ Valid RSS feed');
      console.log(`Title: ${feed.title}`);
      console.log(`Episodes: ${feed.episodes.length}`);
    } catch (error) {
      console.error('✗ Invalid RSS feed:', error.message);
      process.exit(1);
    }
  });

program.parse();