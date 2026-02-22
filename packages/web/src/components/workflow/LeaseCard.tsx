import { t } from '../../i18n/es';

interface Props {
  lease: {
    id: string;
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
    };
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  isLandlord: boolean;
  onEnd?: () => void;
  ending?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('es-CO');
}

export function LeaseCard({ lease, isLandlord, onEnd, ending }: Props) {
  const isActive = lease.status === 'ACTIVE';

  return (
    <div className={`bg-white rounded-2xl shadow-md border p-6 ${isActive ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isActive ? '📝' : '📋'}
          </div>
          <div>
            <h3 className="text-base font-semibold text-rumi-text">{lease.property.title}</h3>
            <p className="text-sm text-rumi-text/50">{lease.property.address}, {lease.property.city}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isActive ? t.workflow.lease.active : t.workflow.lease.ended}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-rumi-bg/50 rounded-lg">
        <div>
          <p className="text-xs text-rumi-text/50">{t.workflow.lease.startDate}</p>
          <p className="text-sm font-medium text-rumi-text">{formatDate(lease.startDate)}</p>
        </div>
        <div>
          <p className="text-xs text-rumi-text/50">{t.workflow.lease.endDate}</p>
          <p className="text-sm font-medium text-rumi-text">{formatDate(lease.endDate)}</p>
        </div>
        <div>
          <p className="text-xs text-rumi-text/50">{t.workflow.lease.monthlyRent}</p>
          <p className="text-sm font-bold text-rumi-primary">${formatPrice(lease.monthlyRent)} COP</p>
        </div>
        <div>
          <p className="text-xs text-rumi-text/50">{t.workflow.lease.tenant}</p>
          <p className="text-sm font-medium text-rumi-text">
            {lease.tenant.firstName} {lease.tenant.lastName}
          </p>
        </div>
      </div>

      {lease.signedAt && (
        <p className="text-xs text-rumi-text/30 mt-3">
          {t.workflow.lease.signedOn} {formatDate(lease.signedAt)}
        </p>
      )}

      {isActive && isLandlord && onEnd && (
        <button
          onClick={onEnd}
          disabled={ending}
          className="mt-4 px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {ending ? '...' : t.workflow.lease.endLease}
        </button>
      )}
    </div>
  );
}
