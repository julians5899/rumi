import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { useAuthStore } from '../store/auth.store';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { IconDocument, IconMapPin, IconCalendar, IconMoney } from '../components/ui/Icons';

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
      <PageHeader title={t.nav2.leases} />

      <ErrorAlert message={error} className="mb-6" />

      {loading && <LoadingState text={t.common.loading} />}

      {!loading && leases.length === 0 && (
        <EmptyState
          icon={<IconDocument className="w-10 h-10" />}
          title={t.workflow.lease.noLeases}
          description={t.workflow.lease.noLeasesSubtitle}
        />
      )}

      {!loading && leases.length > 0 && (
        <div className="space-y-4 stagger-children">
          {leases.map((lease) => {
            const isActive = lease.status === 'ACTIVE';
            const isTenant = lease.tenantId === user?.userId;

            return (
              <Card key={lease.id} variant="elevated" padding="none" className="overflow-hidden">
                <div className="flex gap-4 p-5">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-rumi-bg flex-shrink-0 overflow-hidden">
                    {lease.property.images.length > 0 ? (
                      <img
                        src={lease.property.images[0].url}
                        alt={lease.property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10">
                        <IconDocument className="w-6 h-6 text-rumi-primary/40" />
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
                        <div className="flex items-center gap-1.5 text-sm text-rumi-text/50 mt-0.5">
                          <IconMapPin className="w-3.5 h-3.5" />
                          <span>{lease.property.address}, {lease.property.city}</span>
                        </div>
                      </div>
                      <Badge variant={isActive ? 'success' : 'neutral'} dot>
                        {isActive ? t.workflow.lease.active : t.workflow.lease.ended}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2.5">
                      <div className="flex items-center gap-1.5 text-sm text-rumi-text/60">
                        <IconCalendar className="w-3.5 h-3.5 text-rumi-text/40" />
                        <span>{formatDate(lease.startDate)} — {formatDate(lease.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconMoney className="w-3.5 h-3.5 text-rumi-primary" />
                        <span className="text-sm font-bold text-rumi-primary">${formatPrice(lease.monthlyRent)}/mes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <Avatar
                        src={isTenant ? null : lease.tenant.avatarUrl}
                        name={isTenant ? 'Propietario' : `${lease.tenant.firstName} ${lease.tenant.lastName}`}
                        size="sm"
                      />
                      <div>
                        <span className="text-xs text-rumi-text/40">
                          {isTenant ? t.workflow.lease.landlord : t.workflow.lease.tenant}:
                        </span>{' '}
                        <span className="text-xs font-medium text-rumi-text">
                          {isTenant
                            ? 'Propietario'
                            : `${lease.tenant.firstName} ${lease.tenant.lastName}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
