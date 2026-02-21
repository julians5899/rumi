import { t } from '../i18n/es';

export function PropertyListPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.nav.properties}</h1>
      <p className="text-rumi-text/60">Busca tu hogar ideal entre nuestras publicaciones.</p>
      {/* TODO: Property grid with filters */}
    </div>
  );
}
