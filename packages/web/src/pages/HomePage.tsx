import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import { RumiLogo } from '../components/ui/RumiLogo';

export function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="flex items-center justify-center gap-1 text-4xl font-bold text-rumi-text mb-4">
        Bienvenido a <RumiLogo size="lg" />
      </h1>
      <p className="text-lg text-rumi-text/60 mb-12 max-w-2xl mx-auto">
        Conecta con arrendadores, inquilinos y compañeros de cuarto en toda Colombia.
        Encuentra tu hogar ideal o tu compañero perfecto.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Link
          to="/properties"
          className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-rumi-primary-light/20"
        >
          <span className="text-4xl block mb-4">🏠</span>
          <h3 className="text-lg font-semibold text-rumi-text mb-2">{t.nav.properties}</h3>
          <p className="text-sm text-rumi-text/60">
            Explora apartamentos, casas y habitaciones disponibles
          </p>
        </Link>

        <Link
          to="/roommates"
          className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-rumi-primary-light/20"
        >
          <span className="text-4xl block mb-4">👥</span>
          <h3 className="text-lg font-semibold text-rumi-text mb-2">{t.nav.roommates}</h3>
          <p className="text-sm text-rumi-text/60">
            Encuentra tu compañero de cuarto ideal con nuestro sistema de matching
          </p>
        </Link>

        <Link
          to="/properties/new"
          className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-rumi-primary-light/20"
        >
          <span className="text-4xl block mb-4">📝</span>
          <h3 className="text-lg font-semibold text-rumi-text mb-2">{t.nav.publishProperty}</h3>
          <p className="text-sm text-rumi-text/60">
            Publica tu inmueble y conecta con inquilinos potenciales
          </p>
        </Link>
      </div>
    </div>
  );
}
