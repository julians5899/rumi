import type { FastifyReply, FastifyRequest } from 'fastify';
import * as appointmentsService from './appointments.service';

export async function createAppointmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { applicationId } = request.body as { applicationId: string };
  const appointment = await appointmentsService.createAppointment(request.user!.sub, applicationId);
  return reply.status(201).send(appointment);
}

export async function getAppointmentByApplicationHandler(request: FastifyRequest, reply: FastifyReply) {
  const { applicationId } = request.params as { applicationId: string };
  const appointment = await appointmentsService.getAppointmentByApplication(request.user!.sub, applicationId);
  if (!appointment) {
    return reply.status(404).send({ error: 'Not Found', message: 'No hay cita para esta aplicacion', statusCode: 404 });
  }
  return reply.send(appointment);
}

export async function addSlotsHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { slots } = request.body as { slots: { startTime: string; endTime: string }[] };
  const result = await appointmentsService.addSlots(request.user!.sub, id, slots);
  return reply.send(result);
}

export async function deleteSlotHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id, slotId } = request.params as { id: string; slotId: string };
  await appointmentsService.deleteSlot(request.user!.sub, id, slotId);
  return reply.status(204).send();
}

export async function getMatchesHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const matches = await appointmentsService.getMatches(request.user!.sub, id);
  return reply.send(matches);
}

export async function confirmAppointmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { confirmedStart, confirmedEnd } = request.body as { confirmedStart: string; confirmedEnd: string };
  const appointment = await appointmentsService.confirmAppointment(request.user!.sub, id, confirmedStart, confirmedEnd);
  return reply.send(appointment);
}

export async function completeAppointmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const appointment = await appointmentsService.completeAppointment(request.user!.sub, id);
  return reply.send(appointment);
}

export async function cancelAppointmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const appointment = await appointmentsService.cancelAppointment(request.user!.sub, id);
  return reply.send(appointment);
}
