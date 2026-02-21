import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { buildApp } from './app';

async function start() {
  const app = await buildApp();
  const port = Number(process.env.API_PORT) || 3000;

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Rumi API server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/v1/health`);
    console.log(`Stage: ${process.env.STAGE || 'not set'}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
