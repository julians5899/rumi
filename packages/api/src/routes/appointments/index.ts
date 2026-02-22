import type { FastifyPluginAsync } from 'fastify';
import {
  createAppointmentHandler,
  getAppointmentByApplicationHandler,
  addSlotsHandler,
  deleteSlotHandler,
  getMatchesHandler,
  confirmAppointmentHandler,
  completeAppointmentHandler,
  cancelAppointmentHandler,
} from './appointments.handler';

const appointmentsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.requireAuth] }, createAppointmentHandler);
  app.get('/by-application/:applicationId', { preHandler: [app.requireAuth] }, getAppointmentByApplicationHandler);
  app.post('/:id/slots', { preHandler: [app.requireAuth] }, addSlotsHandler);
  app.delete('/:id/slots/:slotId', { preHandler: [app.requireAuth] }, deleteSlotHandler);
  app.get('/:id/matches', { preHandler: [app.requireAuth] }, getMatchesHandler);
  app.put('/:id/confirm', { preHandler: [app.requireAuth] }, confirmAppointmentHandler);
  app.put('/:id/complete', { preHandler: [app.requireAuth] }, completeAppointmentHandler);
  app.put('/:id/cancel', { preHandler: [app.requireAuth] }, cancelAppointmentHandler);
};

export default appointmentsRoutes;
