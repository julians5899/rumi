import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import { RumiLogo } from '../components/ui/RumiLogo';
import { Card } from '../components/ui/Card';
import { IconBuilding, IconUsers, IconPlus, IconChevronRight } from '../components/ui/Icons';

const features = [
  {
    to: '/properties',
    icon: <IconBuilding className="w-7 h-7" />,
    title: t.nav.properties,
    description: 'Explora apartamentos, casas y habitaciones disponibles',
  },
  {
    to: '/roommates',
    icon: <IconUsers className="w-7 h-7" />,
    title: t.nav.roommates,
    description: 'Encuentra tu companero de cuarto ideal con nuestro sistema de matching',
  },
  {
    to: '/properties/new',
    icon: <IconPlus className="w-7 h-7" />,
    title: t.nav.publishProperty,
    description: 'Publica tu inmueble y conecta con inquilinos potenciales',
  },
];

export function HomePage() {
  return (
    <div className="text-center py-12">
      {/* Hero */}
      <div className="animate-fade-in-up">
        <h1 className="flex items-center justify-center gap-2 text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-rumi-text to-rumi-accent bg-clip-text text-transparent">
            Bienvenido a
          </span>
          <RumiLogo size="lg" />
        </h1>
        <p className="text-lg text-rumi-text/50 mb-12 max-w-xl mx-auto">
          Conecta con arrendadores, inquilinos y companeros de cuarto en toda Colombia.
          Encuentra tu hogar ideal o tu companero perfecto.
        </p>
      </div>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-rumi-primary-light/30 to-transparent mb-12 max-w-lg mx-auto" />

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to} className="block group">
            <Card variant="interactive" padding="lg" className="text-left h-full">
              {/* Icon container */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center text-rumi-primary mb-4 group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>
              {/* Title + arrow */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-rumi-text">{feature.title}</h3>
                <IconChevronRight className="w-4 h-4 text-rumi-text/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <p className="text-sm text-rumi-text/50">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
