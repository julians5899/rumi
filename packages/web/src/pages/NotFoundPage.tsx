import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rumi-bg">
      <h1 className="text-6xl font-bold text-rumi-primary mb-4">404</h1>
      <p className="text-xl text-rumi-text/60 mb-8">Pagina no encontrada</p>
      <Link
        to="/"
        className="px-6 py-3 bg-rumi-primary text-white rounded-lg font-semibold hover:bg-rumi-primary-dark transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
