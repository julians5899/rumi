import { getPrisma } from '../../lib/prisma';
import { getStorage } from '../../lib/storage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

/**
 * Get upload URL for a document.
 * Only the tenant can upload, and only after the appointment is COMPLETED.
 */
export async function getDocumentUploadUrl(
  cognitoSub: string,
  applicationId: string,
  documentType: string,
  contentType: string,
  fileName: string,
) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { appointment: true },
  });

  // Must be the applicant (tenant)
  if (application.applicantId !== user.id) {
    throw Object.assign(new Error('Solo el inquilino puede subir documentos'), { statusCode: 403 });
  }

  // Appointment must be completed
  if (!application.appointment || application.appointment.status !== 'COMPLETED') {
    throw Object.assign(
      new Error('La visita debe estar completada para subir documentos'),
      { statusCode: 400 },
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw Object.assign(
      new Error('Tipo de archivo no permitido. Use JPEG, PNG o PDF'),
      { statusCode: 400 },
    );
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'application/pdf' ? 'pdf' : 'jpg';
  const fileId = crypto.randomUUID();
  const key = `documents/${applicationId}/${documentType}/${fileId}.${ext}`;

  const storage = getStorage();
  const uploadUrl = await storage.getUploadUrl(key, contentType);

  return { uploadUrl, key, fileName };
}

/**
 * Create document record after a successful upload.
 */
export async function createDocument(
  cognitoSub: string,
  data: {
    applicationId: string;
    type: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  },
) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: data.applicationId },
    include: { appointment: true },
  });

  if (application.applicantId !== user.id) {
    throw Object.assign(new Error('Solo el inquilino puede registrar documentos'), { statusCode: 403 });
  }

  if (!application.appointment || application.appointment.status !== 'COMPLETED') {
    throw Object.assign(
      new Error('La visita debe estar completada para registrar documentos'),
      { statusCode: 400 },
    );
  }

  const storage = getStorage();

  return prisma.document.create({
    data: {
      applicationId: data.applicationId,
      uploadedById: user.id,
      type: data.type as 'CC' | 'WORK_CERT' | 'OTHER',
      fileKey: data.fileKey,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    },
    select: {
      id: true,
      applicationId: true,
      type: true,
      status: true,
      fileKey: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      rejectionNote: true,
      createdAt: true,
    },
  }).then((doc) => ({
    ...doc,
    fileUrl: storage.getFileUrl(doc.fileKey),
  }));
}

/**
 * List documents for an application.
 */
export async function getDocumentsByApplication(cognitoSub: string, applicationId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { property: { select: { ownerId: true } } },
  });

  // Must be landlord or tenant
  if (application.applicantId !== user.id && application.property.ownerId !== user.id) {
    throw Object.assign(new Error('No tienes acceso a estos documentos'), { statusCode: 403 });
  }

  const storage = getStorage();
  const docs = await prisma.document.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });

  return docs.map((doc) => ({
    ...doc,
    fileUrl: storage.getFileUrl(doc.fileKey),
  }));
}

/**
 * Approve a document (landlord only).
 */
export async function approveDocument(cognitoSub: string, documentId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    include: { application: { include: { property: { select: { ownerId: true } } } } },
  });

  if (document.application.property.ownerId !== user.id) {
    throw Object.assign(new Error('Solo el arrendador puede aprobar documentos'), { statusCode: 403 });
  }

  if (document.status !== 'PENDING') {
    throw Object.assign(new Error('Solo se pueden aprobar documentos pendientes'), { statusCode: 400 });
  }

  return prisma.document.update({
    where: { id: documentId },
    data: { status: 'APPROVED', rejectionNote: null },
  });
}

/**
 * Reject a document (landlord only).
 */
export async function rejectDocument(cognitoSub: string, documentId: string, rejectionNote: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    include: { application: { include: { property: { select: { ownerId: true } } } } },
  });

  if (document.application.property.ownerId !== user.id) {
    throw Object.assign(new Error('Solo el arrendador puede rechazar documentos'), { statusCode: 403 });
  }

  if (document.status !== 'PENDING') {
    throw Object.assign(new Error('Solo se pueden rechazar documentos pendientes'), { statusCode: 400 });
  }

  return prisma.document.update({
    where: { id: documentId },
    data: { status: 'REJECTED', rejectionNote },
  });
}

/**
 * Delete a document (tenant only, only if PENDING).
 */
export async function deleteDocument(cognitoSub: string, documentId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUniqueOrThrow({ where: { cognitoSub } });
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
  });

  if (document.uploadedById !== user.id) {
    throw Object.assign(new Error('Solo puedes eliminar tus propios documentos'), { statusCode: 403 });
  }

  if (document.status !== 'PENDING') {
    throw Object.assign(new Error('Solo se pueden eliminar documentos pendientes'), { statusCode: 400 });
  }

  return prisma.document.delete({ where: { id: documentId } });
}
