import type { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { getStorage } from '../lib/storage';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

const localUploadsPlugin: FastifyPluginAsync = async (app) => {
  // Only register in localdev
  if (process.env.STAGE !== 'localdev') return;

  // Ensure uploads directory exists
  await mkdir(UPLOADS_DIR, { recursive: true });

  // Serve static files from uploads directory
  await app.register(import('@fastify/static'), {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Upload endpoint — clients PUT file data here for local storage
  app.put<{ Params: { '*': string } }>('/api/v1/uploads/*', async (request, reply) => {
    const key = (request.params as { '*': string })['*'];
    if (!key) {
      return reply.status(400).send({ error: 'Missing file key' });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of request.raw) {
      chunks.push(Buffer.from(chunk));
    }
    const data = Buffer.concat(chunks);

    const storage = getStorage();
    if (storage.storeFile) {
      await storage.storeFile(key, data);
    }

    return reply.send({ ok: true, url: storage.getFileUrl(key) });
  });

  app.log.info('Local uploads plugin registered (localdev mode)');
};

export default localUploadsPlugin;
