import { t } from '../i18n/es';

export function PropertyCreatePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.nav.publishProperty}</h1>
      <p className="text-rumi-text/60">Publica tu inmueble para encontrar inquilinos.</p>
      {/* TODO: Property creation form */}
    </div>
  );
}
