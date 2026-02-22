import type { FastifyPluginAsync } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';
import usersRoutes from './users';
import propertiesRoutes from './properties';
import roommatesRoutes from './roommates';
import matchesRoutes from './matches';
import messagesRoutes from './messages';
import applicationsRoutes from './applications';
import appointmentsRoutes from './appointments';
import documentsRoutes from './documents';
import leasesRoutes from './leases';
import ratingsRoutes from './ratings';

export const registerRoutes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(propertiesRoutes, { prefix: '/properties' });
  await app.register(roommatesRoutes, { prefix: '/roommates' });
  await app.register(matchesRoutes, { prefix: '/matches' });
  await app.register(messagesRoutes, { prefix: '/messages' });
  await app.register(applicationsRoutes, { prefix: '/applications' });
  await app.register(appointmentsRoutes, { prefix: '/appointments' });
  await app.register(documentsRoutes, { prefix: '/documents' });
  await app.register(leasesRoutes, { prefix: '/leases' });
  await app.register(ratingsRoutes, { prefix: '/ratings' });
};
