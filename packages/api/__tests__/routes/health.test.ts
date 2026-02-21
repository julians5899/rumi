import Fastify from 'fastify';
import healthRoutes from '../../src/routes/health';

describe('Health Route', () => {
  const app = Fastify();

  beforeAll(async () => {
    await app.register(healthRoutes, { prefix: '/health' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('rumi-api');
    expect(body.version).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });
});
