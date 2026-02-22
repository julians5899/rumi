import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { useAuthStore } from '../store/auth.store';
import { WorkflowStepper } from '../components/workflow/WorkflowStepper';
import { AvailabilityScheduler } from '../components/workflow/AvailabilityScheduler';
import { AppointmentCard } from '../components/workflow/AppointmentCard';
import { DocumentUpload } from '../components/workflow/DocumentUpload';
import { LeaseForm } from '../components/workflow/LeaseForm';
import { LeaseCard } from '../components/workflow/LeaseCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { IconCalendar, IconCheck, IconX, IconDocument } from '../components/ui/Icons';

interface WorkflowData {
  application: {
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
  };
  property: {
    id: string;
    title: string;
    city: string;
    address: string;
    price: number | string;
    ownerId: string;
    owner: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  };
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  role: 'landlord' | 'tenant';
  currentStage: string;
  appointment: {
    id: string;
    status: string;
    confirmedStart: string | null;
    confirmedEnd: string | null;
    availabilitySlots: {
      id: string;
      startTime: string;
      endTime: string;
      user: { id: string; firstName: string; lastName: string };
    }[];
  } | null;
  documents: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    items: {
      id: string;
      type: string;
      status: string;
      fileName: string;
      fileKey: string;
      fileUrl?: string;
      rejectionNote: string | null;
      createdAt: string;
    }[];
  };
  lease: {
    id: string;
    startDate: string;
    endDate: string;
    monthlyRent: number | string;
    status: string;
    signedAt: string | null;
    property: { id: string; title: string; city: string; address: string };
    tenant: { id: string; firstName: string; lastName: string };
  } | null;
}

export function ApplicationWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmEndLease, setConfirmEndLease] = useState(false);

  const fetchWorkflow = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get<WorkflowData>(`/applications/${id}/workflow`);
      setData(res.data);
      setError('');
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const handleCreateAppointment = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await apiClient.post('/appointments', { applicationId: id });
      fetchWorkflow();
    } catch {
      setError(t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteVisit = async () => {
    if (!data?.appointment) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/appointments/${data.appointment.id}/complete`);
      fetchWorkflow();
    } catch {
      setError(t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndLease = async () => {
    if (!data?.lease) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/leases/${data.lease.id}/end`);
      setConfirmEndLease(false);
      fetchWorkflow();
    } catch {
      setError(t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState text={t.common.loading} />;

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!data) return null;

  const isLandlord = data.role === 'landlord';

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={t.workflow.title}
        backTo="/applications"
        subtitle={
          <div className="flex items-center gap-3 mt-1">
            <Link to={`/properties/${data.property.id}`} className="text-sm text-rumi-primary hover:underline">
              {data.property.title}
            </Link>
            <span className="text-sm text-rumi-text/40">—</span>
            <span className="text-sm text-rumi-text/60">
              {isLandlord
                ? `${data.applicant.firstName} ${data.applicant.lastName}`
                : `${data.property.owner.firstName} ${data.property.owner.lastName}`}
            </span>
          </div>
        }
      />

      {/* Stepper */}
      <WorkflowStepper currentStage={data.currentStage} />

      <ErrorAlert message={error} className="mb-4" />

      {/* ===== STAGE: ACCEPTED — no appointment yet ===== */}
      {data.currentStage === 'ACCEPTED' && (
        <EmptyState
          icon={<IconCalendar className="w-10 h-10" />}
          title={t.workflow.appointment.title}
          description={t.workflow.appointment.subtitle}
          action={{
            label: t.workflow.appointment.createAppointment,
            onClick: handleCreateAppointment,
            loading: actionLoading,
          }}
        />
      )}

      {/* ===== STAGE: SCHEDULING ===== */}
      {data.currentStage === 'SCHEDULING' && data.appointment && (
        <AvailabilityScheduler
          appointmentId={data.appointment.id}
          slots={data.appointment.availabilitySlots}
          currentUserId={user?.userId || ''}
          onUpdate={fetchWorkflow}
        />
      )}

      {/* ===== STAGE: VISIT CONFIRMED ===== */}
      {data.currentStage === 'VISIT_CONFIRMED' && data.appointment && data.appointment.confirmedStart && data.appointment.confirmedEnd && (
        <AppointmentCard
          confirmedStart={data.appointment.confirmedStart}
          confirmedEnd={data.appointment.confirmedEnd}
          propertyAddress={data.property.address}
          propertyCity={data.property.city}
          status="CONFIRMED"
          isLandlord={isLandlord}
          onComplete={handleCompleteVisit}
          completing={actionLoading}
        />
      )}

      {/* ===== STAGE: VISIT COMPLETED — show docs ===== */}
      {data.currentStage === 'VISIT_COMPLETED' && (
        <div className="space-y-6">
          {data.appointment && data.appointment.confirmedStart && data.appointment.confirmedEnd && (
            <AppointmentCard
              confirmedStart={data.appointment.confirmedStart}
              confirmedEnd={data.appointment.confirmedEnd}
              propertyAddress={data.property.address}
              propertyCity={data.property.city}
              status="COMPLETED"
              isLandlord={isLandlord}
            />
          )}
          <div>
            <h2 className="text-lg font-semibold text-rumi-text mb-3">{t.workflow.documents.title}</h2>
            <p className="text-sm text-rumi-text/50 mb-4">
              {isLandlord ? t.workflow.documents.subtitleLandlord : t.workflow.documents.subtitle}
            </p>
            <DocumentUpload
              applicationId={data.application.id}
              documents={data.documents.items}
              isLandlord={isLandlord}
              onUpdate={fetchWorkflow}
            />
          </div>
        </div>
      )}

      {/* ===== STAGE: DOCUMENTS PENDING ===== */}
      {data.currentStage === 'DOCUMENTS_PENDING' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-rumi-text">{t.workflow.documents.title}</h2>
          <p className="text-sm text-rumi-text/50">
            {isLandlord ? t.workflow.documents.subtitleLandlord : t.workflow.documents.subtitle}
          </p>
          <DocumentUpload
            applicationId={data.application.id}
            documents={data.documents.items}
            isLandlord={isLandlord}
            onUpdate={fetchWorkflow}
          />
        </div>
      )}

      {/* ===== STAGE: READY FOR LEASE ===== */}
      {data.currentStage === 'READY_FOR_LEASE' && (
        <div className="space-y-6">
          <Card variant="bordered" padding="md" className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <IconCheck className="w-5 h-5" />
              <p className="font-medium">{t.workflow.documents.allApproved}</p>
            </div>
          </Card>
          {isLandlord ? (
            <LeaseForm
              applicationId={data.application.id}
              propertyPrice={data.property.price}
              onCreated={fetchWorkflow}
            />
          ) : (
            <EmptyState
              icon={<IconDocument className="w-10 h-10" />}
              title="Esperando contrato"
              description="Esperando que el arrendador cree el contrato..."
            />
          )}
        </div>
      )}

      {/* ===== STAGE: LEASE ACTIVE / ENDED ===== */}
      {(data.currentStage === 'LEASE_ACTIVE' || data.currentStage === 'LEASE_ENDED') && data.lease && (
        <LeaseCard
          lease={data.lease}
          isLandlord={isLandlord}
          onEnd={() => setConfirmEndLease(true)}
          ending={actionLoading}
        />
      )}

      {/* ===== STAGE: VISIT CANCELLED ===== */}
      {data.currentStage === 'VISIT_CANCELLED' && (
        <EmptyState
          icon={<IconX className="w-10 h-10" />}
          title={t.workflow.appointment.cancelled}
          description="La visita ha sido cancelada."
        />
      )}

      {/* End Lease Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmEndLease}
        onClose={() => setConfirmEndLease(false)}
        onConfirm={handleEndLease}
        title={t.workflow.lease.endLease}
        message={t.workflow.lease.endConfirm}
        confirmLabel={t.workflow.lease.endLease}
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
