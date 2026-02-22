import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IconHome } from '../components/ui/Icons';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rumi-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-rumi-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-rumi-accent/6 rounded-full blur-3xl" />

      <div className="relative z-10 text-center animate-fade-in-up">
        <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-br from-rumi-primary to-rumi-accent bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-xl text-rumi-text/60 mb-2">Pagina no encontrada</p>
        <p className="text-sm text-rumi-text/40 mb-8 max-w-xs mx-auto">
          Lo sentimos, la pagina que buscas no existe o fue movida.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" icon={<IconHome className="w-5 h-5" />}>
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
