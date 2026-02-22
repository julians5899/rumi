import { useState } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';

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
      <div className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5">
        <h3 className="text-base font-semibold text-rumi-text mb-3">
          {t.workflow.appointment.addSlotTitle}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-rumi-text/60 mb-1">
              {t.workflow.appointment.date}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-rumi-text/60 mb-1">
              {t.workflow.appointment.startTime}
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-rumi-text/60 mb-1">
              {t.workflow.appointment.endTime}
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleAddSlot}
          disabled={adding || !date || !startTime || !endTime}
          className="mt-3 px-4 py-2 text-sm font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors disabled:opacity-50"
        >
          {adding ? '...' : t.workflow.appointment.addSlot}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm">{error}</div>
      )}

      {/* My slots */}
      <div className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5">
        <h3 className="text-base font-semibold text-rumi-text mb-3">
          {t.workflow.appointment.yourSlots}
        </h3>
        {mySlots.length === 0 ? (
          <p className="text-sm text-rumi-text/40">{t.workflow.appointment.noSlots}</p>
        ) : (
          <div className="space-y-2">
            {mySlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between px-3 py-2 bg-rumi-primary/5 rounded-lg">
                <span className="text-sm text-rumi-text">
                  {formatDateTime(slot.startTime)} — {formatDateTime(slot.endTime)}
                </span>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  {t.common.delete}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other party's slots */}
      <div className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5">
        <h3 className="text-base font-semibold text-rumi-text mb-3">
          {t.workflow.appointment.otherSlots}
        </h3>
        {otherSlots.length === 0 ? (
          <p className="text-sm text-rumi-text/40">{t.workflow.appointment.waitingForOther}</p>
        ) : (
          <div className="space-y-2">
            {otherSlots.map((slot) => (
              <div key={slot.id} className="px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-rumi-text">
                  {formatDateTime(slot.startTime)} — {formatDateTime(slot.endTime)}
                </span>
                <span className="text-xs text-rumi-text/40 ml-2">
                  ({slot.user.firstName})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Find matches */}
      {mySlots.length > 0 && otherSlots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-rumi-text">
              {t.workflow.appointment.matchesTitle}
            </h3>
            <button
              onClick={fetchMatches}
              disabled={loadingMatches}
              className="px-3 py-1.5 text-xs font-medium bg-rumi-primary/10 text-rumi-primary rounded-lg hover:bg-rumi-primary/20 transition-colors disabled:opacity-50"
            >
              {loadingMatches ? '...' : t.common.search}
            </button>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-rumi-text/40">{t.workflow.appointment.noMatches}</p>
          ) : (
            <div className="space-y-2">
              {matches.map((match, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-rumi-text">
                    {formatDateTime(match.start)} — {formatDateTime(match.end)}
                  </span>
                  <button
                    onClick={() => handleConfirm(match)}
                    disabled={confirming}
                    className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {confirming ? '...' : t.workflow.appointment.confirmSlot}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
