#!/usr/bin/env node
import { program } from 'commander';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .name('podcast-player')
  .description('CLI for podcast player frontend')
  .version('1.0.0');

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'port to run on', '3000')
  .option('-a, --api-url <url>', 'backend API URL', 'http://localhost:3001')
  .action((options) => {
    process.env.VITE_API_URL = options.apiUrl;
    const vite = spawn('npx', ['vite', '--port', options.port], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    vite.on('error', (error) => {
      console.error('Failed to start dev server:', error);
      process.exit(1);
    });
  });

program
  .command('build')
  .description('Build for production')
  .option('-o, --output <dir>', 'output directory', 'dist')
  .action((options) => {
    const vite = spawn('npx', ['vite', 'build', '--outDir', options.output], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    vite.on('error', (error) => {
      console.error('Build failed:', error);
      process.exit(1);
    });
  });

program
  .command('preview')
  .description('Preview production build')
  .option('-p, --port <port>', 'port to run on', '4173')
  .action((options) => {
    const vite = spawn('npx', ['vite', 'preview', '--port', options.port], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    vite.on('error', (error) => {
      console.error('Failed to start preview server:', error);
      process.exit(1);
    });
  });

program
  .command('test')
  .description('Run tests')
  .action(() => {
    const vitest = spawn('npx', ['vitest'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    vitest.on('error', (error) => {
      console.error('Tests failed:', error);
      process.exit(1);
    });
  });

program.parse();