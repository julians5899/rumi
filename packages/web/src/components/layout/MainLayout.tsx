import { Outlet, Link, useLocation } from 'react-router-dom';
import { t } from '../../i18n/es';
import { RumiLogo } from '../ui/RumiLogo';

const navItems = [
  { path: '/', label: t.nav.home, icon: '🏠' },
  { path: '/properties', label: t.nav.properties, icon: '🏢' },
  { path: '/roommates', label: t.nav.roommates, icon: '👥' },
  { path: '/matches', label: t.nav.matches, icon: '💜' },
  { path: '/messages', label: t.nav.messages, icon: '💬' },
  { path: '/applications', label: t.nav.applications, icon: '📋' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-rumi-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-rumi-primary-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <RumiLogo size="sm" />
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-rumi-primary'
                      : 'text-rumi-text/60 hover:text-rumi-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/profile"
              className="text-sm font-medium text-rumi-accent hover:text-rumi-accent-light"
            >
              {t.nav.profile}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rumi-primary-light/30 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs ${
                location.pathname === item.path
                  ? 'text-rumi-primary'
                  : 'text-rumi-text/40'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
