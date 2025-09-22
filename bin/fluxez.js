#!/usr/bin/env node

// This is the main CLI entry point for the Fluxez SDK

const path = require('path');

// Check if we're in development (running from src) or production (running from dist)
const isDev = process.env.NODE_ENV === 'development';
const cliPath = isDev 
  ? path.join(__dirname, '..', 'src', 'cli', 'index.ts')
  : path.join(__dirname, '..', 'dist', 'cli', 'index.js');

// Handle TypeScript files in development
if (isDev && cliPath.endsWith('.ts')) {
  // Try to use ts-node if available
  try {
    require('ts-node/register');
    require(cliPath);
  } catch (error) {
    console.error('Error: ts-node is required for development mode');
    console.error('Install it with: npm install -g ts-node');
    console.error('Or run: npm run build first');
    process.exit(1);
  }
} else {
  // Production mode - use compiled JS
  try {
    require(cliPath);
  } catch (error) {
    console.error('Error: CLI not found. Make sure the package is built.');
    console.error('Run: npm run build');
    process.exit(1);
  }
}