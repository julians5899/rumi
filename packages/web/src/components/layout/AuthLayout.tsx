import { Outlet } from 'react-router-dom';
import { RumiLogo } from '../ui/RumiLogo';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-rumi-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rumi-primary/8 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rumi-accent/6 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-down">
          <RumiLogo size="lg" className="mb-3" />
          <p className="text-rumi-text/40 text-sm tracking-wide">
            Conecta con tu hogar ideal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/60 animate-scale-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
