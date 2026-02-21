import { t } from '../i18n/es';

export function MatchesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.nav.matches}</h1>
      <p className="text-rumi-text/60">Tus matches con compañeros de cuarto.</p>
      {/* TODO: Match list with chat links */}
    </div>
  );
}
