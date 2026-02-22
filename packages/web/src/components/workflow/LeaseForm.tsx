import { useState } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../ui/ErrorAlert';
import { IconClipboard } from '../ui/Icons';

interface Props {
  applicationId: string;
  propertyPrice: number | string;
  onCreated: () => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200';

const labelClass = 'block text-sm font-medium text-rumi-text/70 mb-1.5';

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
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
          <IconClipboard className="w-5 h-5 text-rumi-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-rumi-text">{t.workflow.lease.title}</h3>
          <p className="text-sm text-rumi-text/50">{t.workflow.lease.subtitle}</p>
        </div>
      </div>

      <ErrorAlert message={error} className="mb-4" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.workflow.lease.startDate}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t.workflow.lease.endDate}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>{t.workflow.lease.monthlyRent}</label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={creating}
          className={(!startDate || !endDate || !monthlyRent) ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {creating ? t.workflow.lease.creating : t.workflow.lease.create}
        </Button>
      </form>
    </Card>
  );
}
