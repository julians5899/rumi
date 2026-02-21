import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { useAuthStore } from '../store/auth.store';
import apiClient from '../services/api-client';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  seekingMode: 'NONE' | 'TENANT' | 'ROOMMATE';
  createdAt: string;
}

const seekingLabels: Record<string, string> = {
  NONE: t.seeking.none,
  TENANT: t.seeking.tenant,
  ROOMMATE: t.seeking.roommate,
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get<UserProfile>('/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Error al cargar el perfil'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-rumi-text/60">{t.common.loading}</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error || t.common.error}
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 w-full py-3 bg-rumi-danger text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          {t.auth.logout}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.nav.profile}</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-rumi-primary-light/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-rumi-primary/20 flex items-center justify-center text-2xl font-bold text-rumi-primary shrink-0">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-rumi-text">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-rumi-text/60">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {profile.phone && (
            <div>
              <span className="text-sm font-medium text-rumi-text/50">Telefono</span>
              <p className="text-rumi-text">{profile.phone}</p>
            </div>
          )}

          {profile.bio && (
            <div>
              <span className="text-sm font-medium text-rumi-text/50">Bio</span>
              <p className="text-rumi-text">{profile.bio}</p>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-rumi-text/50">Modo de busqueda</span>
            <p className="mt-1">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-rumi-primary/10 text-rumi-primary">
                {seekingLabels[profile.seekingMode] || profile.seekingMode}
              </span>
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-rumi-text/50">Miembro desde</span>
            <p className="text-rumi-text">
              {new Date(profile.createdAt).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-rumi-primary-light/20">
        <h3 className="text-lg font-semibold text-rumi-text mb-3">Cuenta</h3>
        <div className="space-y-2 text-sm text-rumi-text/60">
          <p>
            <span className="font-medium text-rumi-text/50">Correo:</span>{' '}
            {user?.email || profile.email}
          </p>
          <p>
            <span className="font-medium text-rumi-text/50">ID:</span>{' '}
            <span className="font-mono text-xs">{profile.id}</span>
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-rumi-danger text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
      >
        {t.auth.logout}
      </button>
    </div>
  );
}
