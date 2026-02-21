import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { loginUser } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { RumiLogo } from '../components/ui/RumiLogo';

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
    <div>
      <div className="flex justify-center mb-6">
        <RumiLogo size="md" />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-rumi-text/80 mb-1">
            {t.auth.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-rumi-primary-light/40 focus:outline-none focus:ring-2 focus:ring-rumi-primary"
            placeholder="tu@correo.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-rumi-text/80 mb-1">
            {t.auth.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-rumi-primary-light/40 focus:outline-none focus:ring-2 focus:ring-rumi-primary"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rumi-primary text-white font-semibold rounded-lg hover:bg-rumi-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : t.auth.login}
        </button>
      </form>
      <p className="text-center text-sm text-rumi-text/60 mt-4">
        {t.auth.noAccount}{' '}
        <Link to="/register" className="text-rumi-primary font-medium">
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
