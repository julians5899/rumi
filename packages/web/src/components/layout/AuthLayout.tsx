import { Outlet } from 'react-router-dom';
import { RumiLogo } from '../ui/RumiLogo';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-rumi-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <RumiLogo size="lg" className="mb-3" />
          <p className="text-rumi-text/60">Conecta con tu hogar ideal</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
