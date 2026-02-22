import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { useAuthStore } from '../store/auth.store';
import apiClient from '../services/api-client';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { IconEdit, IconLogout } from '../components/ui/Icons';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  age: number | null;
  occupation: string | null;
  nationality: string | null;
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  seekingMode: 'NONE' | 'TENANT' | 'ROOMMATE';
  createdAt: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  age: string;
  occupation: string;
  nationality: string;
  gender: string;
}

const genderLabels: Record<string, string> = {
  MALE: t.gender.MALE, FEMALE: t.gender.FEMALE, NON_BINARY: t.gender.NON_BINARY,
  OTHER: t.gender.OTHER, PREFER_NOT_TO_SAY: t.gender.PREFER_NOT_TO_SAY,
};

const seekingLabels: Record<string, string> = {
  NONE: t.seeking.none, TENANT: t.seeking.tenant, ROOMMATE: t.seeking.roommate,
};

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200';

const labelClass = 'block text-sm font-medium text-rumi-text/70 mb-1.5';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm<ProfileFormData>();

  useEffect(() => {
    apiClient
      .get<UserProfile>('/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Error al cargar el perfil'))
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    if (!profile) return;
    reset({
      firstName: profile.firstName, lastName: profile.lastName,
      phone: profile.phone || '', bio: profile.bio || '',
      age: profile.age?.toString() || '', occupation: profile.occupation || '',
      nationality: profile.nationality || '', gender: profile.gender || '',
    });
    setEditing(true);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const payload = {
        firstName: data.firstName, lastName: data.lastName,
        phone: data.phone || null, bio: data.bio || null,
        age: data.age ? parseInt(data.age, 10) : null,
        occupation: data.occupation || null, nationality: data.nationality || null,
        gender: data.gender || null,
      };
      const res = await apiClient.put<UserProfile>('/users/me', payload);
      setProfile(res.data);
      setEditing(false);
    } catch {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) return <LoadingState text={t.common.loading} />;

  if (error && !profile) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <ErrorAlert message={error || t.common.error} />
        <Button variant="danger" fullWidth onClick={handleLogout} className="mt-6">
          {t.auth.logout}
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t.nav.profile}
        action={
          !editing ? (
            <Button variant="outline" size="sm" icon={<IconEdit className="w-4 h-4" />} onClick={startEditing}>
              {t.profile.editProfile}
            </Button>
          ) : undefined
        }
      />

      <ErrorAlert message={error} className="mb-4" />

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card variant="bordered" padding="md" className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-rumi-text">{t.profile.personalInfo}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input {...register('firstName', { required: 'Requerido' })} className={inputClass} />
                {formErrors.firstName && <p className="text-xs text-rumi-danger mt-1.5">{formErrors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input {...register('lastName', { required: 'Requerido' })} className={inputClass} />
                {formErrors.lastName && <p className="text-xs text-rumi-danger mt-1.5">{formErrors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.profile.age}</label>
                <input type="number" min={16} max={120} {...register('age', { min: { value: 16, message: 'Minimo 16' }, max: { value: 120, message: 'Maximo 120' } })} className={inputClass} placeholder="Ej: 28" />
                {formErrors.age && <p className="text-xs text-rumi-danger mt-1.5">{formErrors.age.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t.profile.gender}</label>
                <select {...register('gender')} className={`${inputClass} appearance-none`}>
                  <option value="">-- Seleccionar --</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{genderLabels[g]}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.profile.occupation}</label>
                <input {...register('occupation', { maxLength: 200 })} className={inputClass} placeholder="Ej: Desarrollador de software" />
              </div>
              <div>
                <label className={labelClass}>{t.profile.nationality}</label>
                <input {...register('nationality', { maxLength: 100 })} className={inputClass} placeholder="Ej: Colombiana" />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t.profile.phone}</label>
              <input {...register('phone', { maxLength: 20 })} className={inputClass} placeholder="Ej: +57 300 123 4567" />
            </div>

            <div>
              <label className={labelClass}>{t.profile.bio}</label>
              <textarea {...register('bio', { maxLength: 2000 })} rows={3} className={`${inputClass} resize-none`} placeholder="Cuentanos sobre ti..." />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" loading={saving} className="flex-1" size="lg">
              {saving ? t.common.loading : t.profile.saveProfile}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="flex-1" size="lg">
              {t.common.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Card variant="elevated" padding="none" className="mb-6 overflow-hidden">
            {/* Gradient banner */}
            <div className="h-24 bg-gradient-to-r from-rumi-primary/10 to-rumi-accent/10" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4 mb-4">
                <Avatar
                  src={profile.avatarUrl}
                  name={`${profile.firstName} ${profile.lastName}`}
                  size="xl"
                  className="ring-4 ring-white"
                />
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-rumi-text">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm text-rumi-text/40">{profile.email}</p>
                </div>
              </div>

              <Badge variant="primary" dot className="mb-4">
                {seekingLabels[profile.seekingMode] || profile.seekingMode}
              </Badge>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {profile.age != null && (
                  <div>
                    <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.age}</span>
                    <p className="text-sm text-rumi-text mt-0.5">{profile.age} {t.profile.yearsOld}</p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.gender}</span>
                    <p className="text-sm text-rumi-text mt-0.5">{genderLabels[profile.gender] || profile.gender}</p>
                  </div>
                )}
                {profile.occupation && (
                  <div>
                    <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.occupation}</span>
                    <p className="text-sm text-rumi-text mt-0.5">{profile.occupation}</p>
                  </div>
                )}
                {profile.nationality && (
                  <div>
                    <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.nationality}</span>
                    <p className="text-sm text-rumi-text mt-0.5">{profile.nationality}</p>
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.phone}</span>
                    <p className="text-sm text-rumi-text mt-0.5">{profile.phone}</p>
                  </div>
                )}
              </div>

              {profile.bio && (
                <div className="mt-4 pt-4 border-t border-rumi-primary-light/10">
                  <span className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider">{t.profile.bio}</span>
                  <p className="text-sm text-rumi-text/70 mt-1">{profile.bio}</p>
                </div>
              )}

              <p className="text-xs text-rumi-text/25 mt-4">
                {t.profile.memberSince}{' '}
                {new Date(profile.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Card>

          <Card variant="default" padding="md" className="mb-6">
            <h3 className="text-sm font-semibold text-rumi-text/40 uppercase tracking-wider mb-3">{t.profile.account}</h3>
            <div className="space-y-1.5 text-sm text-rumi-text/50">
              <p><span className="text-rumi-text/40">Correo:</span> {user?.email || profile.email}</p>
              <p><span className="text-rumi-text/40">ID:</span> <span className="font-mono text-xs">{profile.id}</span></p>
            </div>
          </Card>

          <Button variant="danger" fullWidth size="lg" icon={<IconLogout className="w-4 h-4" />} onClick={handleLogout}>
            {t.auth.logout}
          </Button>
        </>
      )}
    </div>
  );
}
