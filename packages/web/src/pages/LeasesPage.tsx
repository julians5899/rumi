import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { useAuthStore } from '../store/auth.store';

interface LeaseItem {
  id: string;
  applicationId: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number | string;
  status: string;
  signedAt: string | null;
  property: {
    id: string;
    title: string;
    city: string;
    address: string;
    price: number | string;
    images: { id: string; url: string }[];
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('es-CO');
}

export function LeasesPage() {
  const [leases, setLeases] = useState<LeaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get<LeaseItem[]>('/leases');
        setLeases(res.data);
      } catch {
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rumi-text">{t.nav2.leases}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <p className="text-rumi-text/50 text-sm">{t.common.loading}</p>
        </div>
      )}

      {!loading && leases.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-lg font-medium text-rumi-text/60">{t.workflow.lease.noLeases}</p>
          <p className="text-sm text-rumi-text/40 mt-1">{t.workflow.lease.noLeasesSubtitle}</p>
        </div>
      )}

      {!loading && leases.length > 0 && (
        <div className="space-y-4">
          {leases.map((lease) => {
            const isActive = lease.status === 'ACTIVE';
            const isTenant = lease.tenantId === user?.userId;

            return (
              <div
                key={lease.id}
                className={`bg-white rounded-2xl shadow-md border overflow-hidden ${isActive ? 'border-green-200' : 'border-gray-200'}`}
              >
                <div className="flex gap-4 p-5">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-rumi-primary/10 flex-shrink-0 overflow-hidden">
                    {lease.property.images.length > 0 ? (
                      <img
                        src={lease.property.images[0].url}
                        alt={lease.property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-rumi-primary/30">
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/properties/${lease.property.id}`}
                          className="text-base font-semibold text-rumi-text hover:text-rumi-primary transition-colors"
                        >
                          {lease.property.title}
                        </Link>
                        <p className="text-sm text-rumi-text/50 mt-0.5">
                          {lease.property.address}, {lease.property.city}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? t.workflow.lease.active : t.workflow.lease.ended}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-rumi-text/60">
                      <span>{formatDate(lease.startDate)} — {formatDate(lease.endDate)}</span>
                      <span className="font-bold text-rumi-primary">${formatPrice(lease.monthlyRent)}/mes</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-rumi-text/40">
                        {isTenant ? t.workflow.lease.landlord : t.workflow.lease.tenant}:
                      </span>
                      <span className="text-xs font-medium text-rumi-text">
                        {isTenant
                          ? 'Propietario'
                          : `${lease.tenant.firstName} ${lease.tenant.lastName}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
