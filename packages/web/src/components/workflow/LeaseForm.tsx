import { useState } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';

interface Props {
  applicationId: string;
  propertyPrice: number | string;
  onCreated: () => void;
}

export function LeaseForm({ applicationId, propertyPrice, onCreated }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(String(Number(propertyPrice)));
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !monthlyRent) return;

    setCreating(true);
    setError('');
    try {
      await apiClient.post('/leases', {
        applicationId,
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
      });
      onCreated();
    } catch {
      setError(t.common.error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">📝</span>
        <div>
          <h3 className="text-base font-semibold text-rumi-text">{t.workflow.lease.title}</h3>
          <p className="text-sm text-rumi-text/50">{t.workflow.lease.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-rumi-text/60 mb-1">
              {t.workflow.lease.startDate}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-rumi-text/60 mb-1">
              {t.workflow.lease.endDate}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-rumi-text/60 mb-1">
            {t.workflow.lease.monthlyRent}
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rumi-primary/40 focus:border-rumi-primary outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !startDate || !endDate || !monthlyRent}
          className="w-full px-4 py-2.5 text-sm font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors disabled:opacity-50"
        >
          {creating ? t.workflow.lease.creating : t.workflow.lease.create}
        </button>
      </form>
    </div>
  );
}
