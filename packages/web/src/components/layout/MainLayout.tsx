import { Outlet, Link, useLocation } from 'react-router-dom';
import { t } from '../../i18n/es';
import { RumiLogo } from '../ui/RumiLogo';
import {
  IconHome,
  IconBuilding,
  IconUsers,
  IconHeart,
  IconMessage,
  IconClipboard,
  IconDocument,
  IconUser,
} from '../ui/Icons';
import { type ReactNode } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: t.nav.home, icon: <IconHome className="w-5 h-5" /> },
  { path: '/properties', label: t.nav.properties, icon: <IconBuilding className="w-5 h-5" /> },
  { path: '/roommates', label: t.nav.roommates, icon: <IconUsers className="w-5 h-5" /> },
  { path: '/matches', label: t.nav.matches, icon: <IconHeart className="w-5 h-5" /> },
  { path: '/messages', label: t.nav.messages, icon: <IconMessage className="w-5 h-5" /> },
  { path: '/applications', label: t.nav.applications, icon: <IconClipboard className="w-5 h-5" /> },
  { path: '/leases', label: t.nav2.leases, icon: <IconDocument className="w-5 h-5" /> },
];

const mobileNavItems = navItems.slice(0, 5);

export function MainLayout() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-rumi-bg">
      {/* Header — Glassmorphism, sticky */}
      <header className="glass-strong sticky top-0 z-40 border-b border-rumi-primary-light/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <RumiLogo size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive(item.path)
                        ? 'bg-rumi-primary/8 text-rumi-primary'
                        : 'text-rumi-text/50 hover:text-rumi-text hover:bg-rumi-text/[0.03]'
                    }
                  `}
                >
                  <span className="w-4 h-4">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isActive('/profile')
                    ? 'bg-rumi-accent/10 text-rumi-accent'
                    : 'text-rumi-text/50 hover:text-rumi-accent hover:bg-rumi-accent/5'
                }
              `}
            >
              <IconUser className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.profile}</span>
            </Link>
          </div>
        </div>

        {/* Gradient bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-rumi-primary-light/20 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 animate-fade-in-up">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation — Glassmorphism */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-rumi-primary-light/15 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div
          className="flex justify-around items-center py-2"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl
                transition-all duration-200
                ${
                  isActive(item.path)
                    ? 'text-rumi-primary'
                    : 'text-rumi-text/30 hover:text-rumi-text/50'
                }
              `}
            >
              <span className="relative">
                {item.icon}
                {/* Active dot indicator */}
                {isActive(item.path) && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rumi-primary" />
                )}
              </span>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
