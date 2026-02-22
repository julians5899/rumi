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
    if (!window.confirm(t.workflow.lease.endConfirm)) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/leases/${data.lease.id}/end`);
      fetchWorkflow();
    } catch {
      setError(t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-rumi-text/50 text-sm">{t.common.loading}</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const isLandlord = data.role === 'landlord';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/applications" className="text-sm text-rumi-primary hover:underline mb-2 inline-block">
          ← {t.common.back}
        </Link>
        <h1 className="text-2xl font-bold text-rumi-text">{t.workflow.title}</h1>
        <div className="flex items-center gap-3 mt-2">
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
      </div>

      {/* Stepper */}
      <WorkflowStepper currentStage={data.currentStage} />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm mb-4">{error}</div>
      )}

      {/* ===== STAGE: ACCEPTED — no appointment yet ===== */}
      {data.currentStage === 'ACCEPTED' && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-lg font-medium text-rumi-text/60">{t.workflow.appointment.title}</p>
          <p className="text-sm text-rumi-text/40 mt-1">{t.workflow.appointment.subtitle}</p>
          <button
            onClick={handleCreateAppointment}
            disabled={actionLoading}
            className="mt-5 px-5 py-2.5 text-sm font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors disabled:opacity-50"
          >
            {actionLoading ? '...' : t.workflow.appointment.createAppointment}
          </button>
        </div>
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
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <p className="text-green-700 font-medium">✓ {t.workflow.documents.allApproved}</p>
          </div>
          {isLandlord ? (
            <LeaseForm
              applicationId={data.application.id}
              propertyPrice={data.property.price}
              onCreated={fetchWorkflow}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-rumi-text/60">Esperando que el arrendador cree el contrato...</p>
            </div>
          )}
        </div>
      )}

      {/* ===== STAGE: LEASE ACTIVE / ENDED ===== */}
      {(data.currentStage === 'LEASE_ACTIVE' || data.currentStage === 'LEASE_ENDED') && data.lease && (
        <LeaseCard
          lease={data.lease}
          isLandlord={isLandlord}
          onEnd={handleEndLease}
          ending={actionLoading}
        />
      )}

      {/* ===== STAGE: VISIT CANCELLED ===== */}
      {data.currentStage === 'VISIT_CANCELLED' && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">❌</p>
          <p className="text-lg font-medium text-rumi-text/60">{t.workflow.appointment.cancelled}</p>
        </div>
      )}
    </div>
  );
}
