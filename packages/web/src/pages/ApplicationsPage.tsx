import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';

interface SentApplication {
  id: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    price: number | string;
  };
}

interface ReceivedApplication {
  id: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    price: number | string;
  };
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

type Tab = 'sent' | 'received';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  PENDING: t.application.pending,
  ACCEPTED: t.application.accepted,
  REJECTED: t.application.rejected,
  WITHDRAWN: t.application.withdrawn,
};

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('es-CO');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-500'}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export function ApplicationsPage() {
  const [tab, setTab] = useState<Tab>('sent');
  const [sent, setSent] = useState<SentApplication[]>([]);
  const [received, setReceived] = useState<ReceivedApplication[]>([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSent = useCallback(async () => {
    setLoadingSent(true);
    try {
      const res = await apiClient.get<SentApplication[]>('/applications/sent');
      setSent(res.data);
    } catch {
      setError(t.common.error);
    } finally {
      setLoadingSent(false);
    }
  }, []);

  const fetchReceived = useCallback(async () => {
    setLoadingReceived(true);
    try {
      const res = await apiClient.get<ReceivedApplication[]>('/applications/received');
      setReceived(res.data);
    } catch {
      setError(t.common.error);
    } finally {
      setLoadingReceived(false);
    }
  }, []);

  useEffect(() => {
    fetchSent();
    fetchReceived();
  }, [fetchSent, fetchReceived]);

  const handleStatusUpdate = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(applicationId);
    setError('');
    try {
      await apiClient.put(`/applications/${applicationId}/status`, { status });
      setReceived((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app)),
      );
    } catch {
      setError(t.common.error);
    } finally {
      setUpdatingId(null);
    }
  };

  const isLoading = tab === 'sent' ? loadingSent : loadingReceived;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rumi-text">{t.nav.applications}</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
            tab === 'sent'
              ? 'border-rumi-primary text-rumi-primary'
              : 'border-transparent text-rumi-text/50 hover:text-rumi-text/70'
          }`}
        >
          {t.application.sent}
          {sent.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-rumi-primary/10 text-rumi-primary">
              {sent.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('received')}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
            tab === 'received'
              ? 'border-rumi-primary text-rumi-primary'
              : 'border-transparent text-rumi-text/50 hover:text-rumi-text/70'
          }`}
        >
          {t.application.received}
          {received.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-rumi-primary/10 text-rumi-primary">
              {received.length}
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <p className="text-rumi-text/50 text-sm">{t.common.loading}</p>
        </div>
      )}

      {/* ===== SENT TAB ===== */}
      {tab === 'sent' && !loadingSent && (
        <>
          {sent.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-lg font-medium text-rumi-text/60">{t.application.noSent}</p>
              <p className="text-sm text-rumi-text/40 mt-1">{t.application.noSentSubtitle}</p>
              <Link
                to="/properties"
                className="inline-block mt-5 px-5 py-2.5 text-sm font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors"
              >
                {t.nav.properties}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sent.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/properties/${app.property.id}`}
                        className="text-base font-semibold text-rumi-text hover:text-rumi-primary transition-colors"
                      >
                        {app.property.title}
                      </Link>
                      <p className="text-sm text-rumi-text/50 mt-0.5">
                        {app.property.city} &bull; ${formatPrice(app.property.price)} COP
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  {app.message && (
                    <div className="mt-3 p-3 bg-rumi-bg/50 rounded-lg">
                      <p className="text-sm text-rumi-text/70 italic">&ldquo;{app.message}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-rumi-text/30">
                      {t.application.appliedOn} {formatDate(app.createdAt)}
                    </p>
                    {app.status === 'ACCEPTED' && (
                      <Link
                        to={`/applications/${app.id}/workflow`}
                        className="px-3 py-1.5 text-xs font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors"
                      >
                        {t.application.continueProcess} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== RECEIVED TAB ===== */}
      {tab === 'received' && !loadingReceived && (
        <>
          {received.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📬</p>
              <p className="text-lg font-medium text-rumi-text/60">{t.application.noReceived}</p>
              <p className="text-sm text-rumi-text/40 mt-1">{t.application.noReceivedSubtitle}</p>
              <Link
                to="/properties/new"
                className="inline-block mt-5 px-5 py-2.5 text-sm font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors"
              >
                {t.nav.publishProperty}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {received.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Applicant avatar */}
                    <div className="w-12 h-12 rounded-full bg-rumi-primary/10 flex-shrink-0 flex items-center justify-center text-lg font-bold text-rumi-primary overflow-hidden">
                      {app.applicant.avatarUrl ? (
                        <img
                          src={app.applicant.avatarUrl}
                          alt={app.applicant.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${app.applicant.firstName[0]}${app.applicant.lastName[0]}`
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-rumi-text">
                            {app.applicant.firstName} {app.applicant.lastName}
                          </p>
                          <p className="text-sm text-rumi-text/50 mt-0.5">
                            para{' '}
                            <Link
                              to={`/properties/${app.property.id}`}
                              className="text-rumi-primary hover:underline"
                            >
                              {app.property.title}
                            </Link>
                          </p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      {app.message && (
                        <div className="mt-3 p-3 bg-rumi-bg/50 rounded-lg">
                          <p className="text-sm text-rumi-text/70 italic">&ldquo;{app.message}&rdquo;</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-rumi-text/30">
                          {t.application.receivedOn} {formatDate(app.createdAt)}
                        </p>
                        {app.status === 'ACCEPTED' && (
                          <Link
                            to={`/applications/${app.id}/workflow`}
                            className="px-3 py-1.5 text-xs font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors"
                          >
                            {t.application.continueProcess} →
                          </Link>
                        )}
                      </div>

                      {/* Accept / Reject buttons */}
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                            disabled={updatingId === app.id}
                            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {updatingId === app.id ? '...' : `✓ ${t.application.accept}`}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                            disabled={updatingId === app.id}
                            className="px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {updatingId === app.id ? '...' : `✗ ${t.application.reject}`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
