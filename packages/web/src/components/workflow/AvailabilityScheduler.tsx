import { useState } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ErrorAlert } from '../ui/ErrorAlert';
import { IconPlus, IconTrash, IconCalendar, IconSearch, IconCheck } from '../ui/Icons';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  user: { id: string; firstName: string; lastName: string };
}

interface Match {
  start: string;
  end: string;
}

interface Props {
  appointmentId: string;
  slots: Slot[];
  currentUserId: string;
  onUpdate: () => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200';

const labelClass = 'block text-xs font-medium text-rumi-text/60 mb-1.5';

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AvailabilityScheduler({ appointmentId, slots, currentUserId, onUpdate }: Props) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const mySlots = slots.filter((s) => s.user.id === currentUserId);
  const otherSlots = slots.filter((s) => s.user.id !== currentUserId);

  const handleAddSlot = async () => {
    if (!date || !startTime || !endTime) return;
    setAdding(true);
    setError('');
    try {
      await apiClient.post(`/appointments/${appointmentId}/slots`, {
        slots: [{
          startTime: new Date(`${date}T${startTime}`).toISOString(),
          endTime: new Date(`${date}T${endTime}`).toISOString(),
        }],
      });
      setDate('');
      setStartTime('');
      setEndTime('');
      onUpdate();
    } catch {
      setError(t.common.error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await apiClient.delete(`/appointments/${appointmentId}/slots/${slotId}`);
      onUpdate();
    } catch {
      setError(t.common.error);
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const res = await apiClient.get<{ matches: Match[] }>(`/appointments/${appointmentId}/matches`);
      setMatches(res.data.matches);
    } catch {
      setError(t.common.error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleConfirm = async (match: Match) => {
    setConfirming(true);
    setError('');
    try {
      await apiClient.put(`/appointments/${appointmentId}/confirm`, {
        confirmedStart: match.start,
        confirmedEnd: match.end,
      });
      onUpdate();
    } catch {
      setError(t.common.error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new slot */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
            <IconCalendar className="w-4 h-4 text-rumi-primary" />
          </div>
          <h3 className="text-base font-semibold text-rumi-text">
            {t.workflow.appointment.addSlotTitle}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>{t.workflow.appointment.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t.workflow.appointment.startTime}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t.workflow.appointment.endTime}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<IconPlus className="w-4 h-4" />}
          onClick={handleAddSlot}
          loading={adding}
          className={`mt-3 ${(!date || !startTime || !endTime) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t.workflow.appointment.addSlot}
        </Button>
      </Card>

      <ErrorAlert message={error} />

      {/* My slots */}
      <Card variant="elevated" padding="md">
        <h3 className="text-base font-semibold text-rumi-text mb-3">
          {t.workflow.appointment.yourSlots}
        </h3>
        {mySlots.length === 0 ? (
          <p className="text-sm text-rumi-text/40">{t.workflow.appointment.noSlots}</p>
        ) : (
          <div className="space-y-2">
            {mySlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between px-4 py-2.5 bg-rumi-primary/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-3.5 h-3.5 text-rumi-primary/50" />
                  <span className="text-sm text-rumi-text">
                    {formatDateTime(slot.startTime)} — {formatDateTime(slot.endTime)}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-1.5 rounded-lg text-rumi-text/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Other party's slots */}
      <Card variant="elevated" padding="md">
        <h3 className="text-base font-semibold text-rumi-text mb-3">
          {t.workflow.appointment.otherSlots}
        </h3>
        {otherSlots.length === 0 ? (
          <p className="text-sm text-rumi-text/40">{t.workflow.appointment.waitingForOther}</p>
        ) : (
          <div className="space-y-2">
            {otherSlots.map((slot) => (
              <div key={slot.id} className="px-4 py-2.5 bg-rumi-bg rounded-xl">
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-3.5 h-3.5 text-rumi-text/30" />
                  <span className="text-sm text-rumi-text">
                    {formatDateTime(slot.startTime)} — {formatDateTime(slot.endTime)}
                  </span>
                  <Badge variant="neutral" size="sm">{slot.user.firstName}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Find matches */}
      {mySlots.length > 0 && otherSlots.length > 0 && (
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-rumi-text">
              {t.workflow.appointment.matchesTitle}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<IconSearch className="w-4 h-4" />}
              onClick={fetchMatches}
              loading={loadingMatches}
            >
              {t.common.search}
            </Button>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-rumi-text/40">{t.workflow.appointment.noMatches}</p>
          ) : (
            <div className="space-y-2">
              {matches.map((match, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <IconCheck className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-sm text-rumi-text">
                      {formatDateTime(match.start)} — {formatDateTime(match.end)}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<IconCheck className="w-3.5 h-3.5" />}
                    onClick={() => handleConfirm(match)}
                    loading={confirming}
                    className="!bg-green-600 hover:!bg-green-700"
                  >
                    {t.workflow.appointment.confirmSlot}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
