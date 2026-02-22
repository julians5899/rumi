import { t } from '../../i18n/es';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconCalendar, IconClock, IconMapPin, IconCheck } from '../ui/Icons';

interface Props {
  confirmedStart: string;
  confirmedEnd: string;
  propertyAddress: string;
  propertyCity: string;
  status: 'CONFIRMED' | 'COMPLETED';
  isLandlord: boolean;
  onComplete?: () => void;
  completing?: boolean;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AppointmentCard({
  confirmedStart,
  confirmedEnd,
  propertyAddress,
  propertyCity,
  status,
  isLandlord,
  onComplete,
  completing,
}: Props) {
  const isCompleted = status === 'COMPLETED';

  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isCompleted
            ? 'bg-green-100 text-green-600'
            : 'bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 text-rumi-primary'
        }`}>
          {isCompleted ? <IconCheck className="w-5 h-5" /> : <IconCalendar className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-rumi-text">
            {isCompleted ? t.workflow.appointment.completed : t.workflow.appointment.confirmed}
          </h3>
          <p className="text-sm text-rumi-text/50">
            {isCompleted
              ? t.workflow.appointment.completedSubtitle
              : t.workflow.appointment.confirmedSubtitle}
          </p>
        </div>
        <Badge variant={isCompleted ? 'success' : 'primary'} dot>
          {isCompleted ? 'Completada' : 'Confirmada'}
        </Badge>
      </div>

      <div className="space-y-2.5 p-4 bg-rumi-bg/50 rounded-xl">
        <div className="flex items-center gap-2.5">
          <IconCalendar className="w-4 h-4 text-rumi-text/40 flex-shrink-0" />
          <span className="text-sm font-medium text-rumi-text">{formatDateTime(confirmedStart)}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <IconClock className="w-4 h-4 text-rumi-text/40 flex-shrink-0" />
          <span className="text-sm text-rumi-text">
            Hasta {new Date(confirmedEnd).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <IconMapPin className="w-4 h-4 text-rumi-text/40 flex-shrink-0" />
          <span className="text-sm text-rumi-text">{propertyAddress}, {propertyCity}</span>
        </div>
      </div>

      {!isCompleted && isLandlord && onComplete && (
        <Button
          variant="primary"
          fullWidth
          onClick={onComplete}
          loading={completing}
          icon={<IconCheck className="w-4 h-4" />}
          className="mt-4 !bg-green-600 hover:!bg-green-700"
        >
          {t.workflow.appointment.completeVisit}
        </Button>
      )}
    </Card>
  );
}
