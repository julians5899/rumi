import { t } from '../../i18n/es';

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
    <div className={`bg-white rounded-2xl shadow-md border p-6 ${isCompleted ? 'border-green-200' : 'border-rumi-primary-light/20'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCompleted ? 'bg-green-100' : 'bg-rumi-primary/10'}`}>
          {isCompleted ? '✅' : '📅'}
        </div>
        <div>
          <h3 className="text-base font-semibold text-rumi-text">
            {isCompleted ? t.workflow.appointment.completed : t.workflow.appointment.confirmed}
          </h3>
          <p className="text-sm text-rumi-text/50">
            {isCompleted
              ? t.workflow.appointment.completedSubtitle
              : t.workflow.appointment.confirmedSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-2 p-4 bg-rumi-bg/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-rumi-text/50">📅</span>
          <span className="text-sm font-medium text-rumi-text">{formatDateTime(confirmedStart)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-rumi-text/50">⏰</span>
          <span className="text-sm text-rumi-text">
            Hasta {new Date(confirmedEnd).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-rumi-text/50">📍</span>
          <span className="text-sm text-rumi-text">{propertyAddress}, {propertyCity}</span>
        </div>
      </div>

      {!isCompleted && isLandlord && onComplete && (
        <button
          onClick={onComplete}
          disabled={completing}
          className="mt-4 w-full px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {completing ? '...' : t.workflow.appointment.completeVisit}
        </button>
      )}
    </div>
  );
}
