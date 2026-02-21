import { t } from '../i18n/es';

export function ApplicationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.nav.applications}</h1>
      <p className="text-rumi-text/60">Gestiona tus aplicaciones enviadas y recibidas.</p>
      {/* TODO: Applications tabs (sent/received) */}
    </div>
  );
}
