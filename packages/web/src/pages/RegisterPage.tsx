import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { registerUser } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerUser(form);
      setUser({ sub: res.user.cognitoSub, email: res.user.email, token: res.token });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al registrarse';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-rumi-text mb-6">{t.auth.register}</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-rumi-text/80 mb-1">Nombre</label>
            <input
              type="text"
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="w-full px-4 py-3 rounded-lg border border-rumi-primary-light/40 focus:outline-none focus:ring-2 focus:ring-rumi-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-rumi-text/80 mb-1">Apellido</label>
            <input
              type="text"
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="w-full px-4 py-3 rounded-lg border border-rumi-primary-light/40 focus:outline-none focus:ring-2 focus:ring-rumi-primary"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-rumi-text/80 mb-1">
            {t.auth.email}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
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
            value={form.password}
            onChange={handleChange('password')}
            className="w-full px-4 py-3 rounded-lg border border-rumi-primary-light/40 focus:outline-none focus:ring-2 focus:ring-rumi-primary"
            minLength={8}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rumi-primary text-white font-semibold rounded-lg hover:bg-rumi-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Registrando...' : t.auth.register}
        </button>
      </form>
      <p className="text-center text-sm text-rumi-text/60 mt-4">
        {t.auth.hasAccount}{' '}
        <Link to="/login" className="text-rumi-primary font-medium">
          {t.auth.login}
        </Link>
      </p>
    </div>
  );
}
