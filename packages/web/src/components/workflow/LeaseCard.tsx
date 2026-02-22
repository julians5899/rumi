import { t } from '../../i18n/es';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconClipboard, IconCalendar, IconMoney, IconUser } from '../ui/Icons';

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
    <Card variant="elevated" padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive
              ? 'bg-green-100 text-green-600'
              : 'bg-rumi-bg text-rumi-text/40'
          }`}>
            <IconClipboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-rumi-text">{lease.property.title}</h3>
            <p className="text-sm text-rumi-text/50">{lease.property.address}, {lease.property.city}</p>
          </div>
        </div>
        <Badge variant={isActive ? 'success' : 'neutral'} dot>
          {isActive ? t.workflow.lease.active : t.workflow.lease.ended}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-rumi-bg/50 rounded-xl">
        <div className="flex items-start gap-2.5">
          <IconCalendar className="w-4 h-4 text-rumi-text/40 mt-0.5" />
          <div>
            <p className="text-xs text-rumi-text/50">{t.workflow.lease.startDate}</p>
            <p className="text-sm font-medium text-rumi-text">{formatDate(lease.startDate)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <IconCalendar className="w-4 h-4 text-rumi-text/40 mt-0.5" />
          <div>
            <p className="text-xs text-rumi-text/50">{t.workflow.lease.endDate}</p>
            <p className="text-sm font-medium text-rumi-text">{formatDate(lease.endDate)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <IconMoney className="w-4 h-4 text-rumi-primary mt-0.5" />
          <div>
            <p className="text-xs text-rumi-text/50">{t.workflow.lease.monthlyRent}</p>
            <p className="text-sm font-bold text-rumi-primary">${formatPrice(lease.monthlyRent)} COP</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <IconUser className="w-4 h-4 text-rumi-text/40 mt-0.5" />
          <div>
            <p className="text-xs text-rumi-text/50">{t.workflow.lease.tenant}</p>
            <p className="text-sm font-medium text-rumi-text">
              {lease.tenant.firstName} {lease.tenant.lastName}
            </p>
          </div>
        </div>
      </div>

      {lease.signedAt && (
        <p className="text-xs text-rumi-text/30 mt-3">
          {t.workflow.lease.signedOn} {formatDate(lease.signedAt)}
        </p>
      )}

      {isActive && isLandlord && onEnd && (
        <Button
          variant="danger"
          size="sm"
          onClick={onEnd}
          loading={ending}
          className="mt-4"
        >
          {t.workflow.lease.endLease}
        </Button>
      )}
    </Card>
  );
}
