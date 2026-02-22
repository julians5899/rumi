import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { loginUser } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      setUser({ sub: res.user.cognitoSub, userId: res.user.id, email: res.user.email, token: res.token });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al iniciar sesion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-rumi-text mb-1">{t.auth.login}</h2>
      <p className="text-sm text-rumi-text/40 mb-6">Ingresa a tu cuenta para continuar</p>

      <ErrorAlert message={error} onDismiss={() => setError('')} className="mb-4" />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-rumi-text/70 mb-1.5">
            {t.auth.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200"
            placeholder="tu@correo.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-rumi-text/70 mb-1.5">
            {t.auth.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200"
            required
          />
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? 'Ingresando...' : t.auth.login}
        </Button>
      </form>

      <div className="border-t border-rumi-primary-light/15 pt-4 mt-6">
        <p className="text-center text-sm text-rumi-text/50">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="text-rumi-primary font-semibold hover:text-rumi-primary-dark transition-colors">
            {t.auth.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
