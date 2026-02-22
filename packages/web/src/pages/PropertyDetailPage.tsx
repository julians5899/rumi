import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { useAuthStore } from '../store/auth.store';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  IconArrowLeft, IconBed, IconBath, IconArea, IconBuilding,
  IconChevronLeft, IconChevronRight, IconCheck, IconClipboard, IconMapPin,
} from '../components/ui/Icons';

const PropertyMap = lazy(() => import('../components/ui/PropertyMap'));

interface PropertyImage {
  id: string;
  url: string;
  order: number;
}

interface PropertyOwner {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number | string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number | string | null;
  address: string;
  city: string;
  neighborhood: string | null;
  department: string;
  latitude: number | string | null;
  longitude: number | string | null;
  amenities: string[];
  images: PropertyImage[];
  owner: PropertyOwner;
  isActive: boolean;
  createdAt: string;
}

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('es-CO');
}

const amenityLabels: Record<string, string> = {
  wifi: 'WiFi', parking: 'Parqueadero', laundry: 'Lavanderia', gym: 'Gimnasio',
  pool: 'Piscina', security: 'Seguridad', elevator: 'Ascensor', furnished: 'Amoblado',
  pets_allowed: 'Mascotas', balcony: 'Balcon', air_conditioning: 'Aire acondicionado',
  hot_water: 'Agua caliente',
};

export function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get<Property>(`/properties/${id}`)
      .then((res) => {
        setProperty(res.data);
        apiClient.post(`/properties/${id}/view`).catch(() => {});
      })
      .catch(() => setError('No se encontro la propiedad'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = property ? property.owner.id === authUser?.userId : false;

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/properties/${id}`);
      navigate('/properties');
    } catch {
      setError('Error al eliminar la propiedad');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleApply = async () => {
    if (!id) return;
    setApplyError('');
    try {
      await apiClient.post('/applications', {
        propertyId: id,
        message: applicationMessage || undefined,
      });
      setApplied(true);
      setApplying(false);
    } catch {
      setApplyError('Error al enviar la aplicacion');
    }
  };

  if (loading) {
    return <LoadingState text={t.common.loading} />;
  }

  if (error || !property) {
    return (
      <div className="py-12 text-center">
        <ErrorAlert message={error || t.common.error} className="inline-block" />
        <div className="mt-4">
          <Link to="/properties" className="text-rumi-primary text-sm font-semibold hover:underline">
            &larr; {t.common.back} a {t.nav.properties}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-rumi-text/40 font-medium hover:text-rumi-primary mb-4 transition-colors"
      >
        <IconArrowLeft className="w-4 h-4" /> {t.common.back}
      </button>

      {/* Image Gallery */}
      <Card variant="elevated" padding="none" className="overflow-hidden mb-6">
        {property.images.length > 0 ? (
          <div>
            <div className="h-64 sm:h-80 md:h-96 relative group">
              <img
                src={property.images[currentImage].url}
                alt={property.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => (i > 0 ? i - 1 : property.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-rumi-text/70 hover:text-rumi-text hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <IconChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((i) => (i < property.images.length - 1 ? i + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-rumi-text/70 hover:text-rumi-text hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <IconChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 glass px-3 py-1 rounded-full text-xs font-medium text-rumi-text/70">
                    {currentImage + 1} / {property.images.length}
                  </span>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-white">
                {property.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 transition-all ${
                      i === currentImage
                        ? 'ring-2 ring-rumi-primary ring-offset-2 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-rumi-primary/5 to-rumi-accent/5">
            <IconBuilding className="w-16 h-16 text-rumi-primary/20" />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Title & badges */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={property.listingType === 'RENT' ? 'primary' : 'accent'}>
                {t.property.listingTypes[property.listingType as 'RENT' | 'SALE']}
              </Badge>
              <Badge variant="neutral">
                {t.property.types[property.propertyType as 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO']}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-rumi-text">{property.title}</h1>
            <p className="text-rumi-text/40 mt-1 flex items-center gap-1.5">
              <IconMapPin className="w-4 h-4" />
              {property.address}
              {property.neighborhood ? `, ${property.neighborhood}` : ''}
              , {property.city}, {property.department}
            </p>
          </div>

          {/* Price */}
          <Card variant="elevated" className="border-l-4 border-l-rumi-primary">
            <p className="text-3xl font-bold text-rumi-primary">
              ${formatPrice(property.price)}{' '}
              <span className="text-base font-normal text-rumi-text/40">
                {property.currency}
                {property.listingType === 'RENT' ? t.property.perMonth : ''}
              </span>
            </p>
          </Card>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="md" className="text-center bg-rumi-bg">
              <IconBed className="w-6 h-6 text-rumi-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-rumi-text">{property.bedrooms}</p>
              <p className="text-xs text-rumi-text/40 mt-0.5">{t.property.bedrooms}</p>
            </Card>
            <Card padding="md" className="text-center bg-rumi-bg">
              <IconBath className="w-6 h-6 text-rumi-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-rumi-text">{property.bathrooms}</p>
              <p className="text-xs text-rumi-text/40 mt-0.5">{t.property.bathrooms}</p>
            </Card>
            <Card padding="md" className="text-center bg-rumi-bg">
              <IconArea className="w-6 h-6 text-rumi-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-rumi-text">{property.area ? `${Number(property.area)}` : '\u2014'}</p>
              <p className="text-xs text-rumi-text/40 mt-0.5">{t.property.area}</p>
            </Card>
          </div>

          {/* Description */}
          <Card variant="default" padding="md">
            <h2 className="text-lg font-semibold text-rumi-text mb-3">{t.property.description}</h2>
            <p className="text-rumi-text/70 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </Card>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <Card variant="default" padding="md">
              <h2 className="text-lg font-semibold text-rumi-text mb-3">{t.property.amenities}</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="primary" size="md" icon={<IconCheck className="w-3.5 h-3.5" />}>
                    {amenityLabels[amenity] || amenity}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Location Map */}
          {property.latitude && property.longitude && (
            <Card variant="default" padding="md">
              <h2 className="text-lg font-semibold text-rumi-text mb-3 flex items-center gap-2">
                <IconMapPin className="w-5 h-5 text-rumi-primary" />
                {t.map.location}
              </h2>
              <div className="rounded-xl overflow-hidden">
                <Suspense fallback={<div className="h-[300px] animate-shimmer rounded-xl" />}>
                  <PropertyMap
                    markers={[{
                      id: property.id,
                      position: [Number(property.latitude), Number(property.longitude)],
                      title: property.title,
                    }]}
                    center={[Number(property.latitude), Number(property.longitude)]}
                    zoom={15}
                    height="300px"
                  />
                </Suspense>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Card */}
          <Card variant="elevated" padding="md">
            <h3 className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider mb-3">{t.property.owner}</h3>
            <div className="flex items-center gap-3">
              <Avatar
                src={property.owner.avatarUrl}
                name={`${property.owner.firstName} ${property.owner.lastName}`}
                size="lg"
              />
              <div>
                <p className="font-semibold text-rumi-text">
                  {property.owner.firstName} {property.owner.lastName}
                </p>
              </div>
            </div>
          </Card>

          {/* Owner Panel or Apply Card */}
          {isOwner ? (
            <Card variant="elevated" padding="md">
              <h3 className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider mb-3">{t.property.yourProperty}</h3>
              <Link
                to="/applications"
                className="flex items-center justify-between p-3 bg-rumi-primary/5 rounded-xl mb-3 hover:bg-rumi-primary/10 transition-colors group"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-rumi-text">
                  <IconClipboard className="w-4 h-4 text-rumi-primary" />
                  {t.property.seeApplications}
                </span>
                <IconChevronRight className="w-4 h-4 text-rumi-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => setShowDeleteConfirm(true)}
                loading={deleting}
              >
                {t.common.delete}
              </Button>
            </Card>
          ) : (
            <Card variant="elevated" padding="md">
              {applied ? (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-rumi-success/10 flex items-center justify-center mx-auto mb-3">
                    <IconCheck className="w-6 h-6 text-rumi-success" />
                  </div>
                  <p className="text-rumi-primary font-semibold">Aplicacion enviada</p>
                  <p className="text-sm text-rumi-text/40 mt-1">El propietario revisara tu solicitud</p>
                </div>
              ) : applying ? (
                <div>
                  <h3 className="text-xs font-semibold text-rumi-text/40 uppercase tracking-wider mb-3">{t.property.apply}</h3>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-sm border-2 border-rumi-primary-light/30 rounded-xl focus:ring-4 focus:ring-rumi-primary/10 focus:border-rumi-primary focus:outline-none resize-none mb-3 transition-all duration-200 placeholder:text-rumi-text/30"
                    placeholder={t.application.message}
                  />
                  {applyError && <ErrorAlert message={applyError} className="mb-3" />}
                  <div className="flex gap-2">
                    <Button variant="primary" size="md" onClick={handleApply} className="flex-1">
                      {t.common.confirm}
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => { setApplying(false); setApplyError(''); }} className="flex-1">
                      {t.common.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="primary" size="lg" fullWidth onClick={() => setApplying(true)}>
                  {t.property.apply}
                </Button>
              )}
            </Card>
          )}

          {/* Published date */}
          <p className="text-xs text-rumi-text/30 text-center">
            {t.property.publishedOn}{' '}
            {new Date(property.createdAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t.common.delete}
        message={t.property.deleteConfirm}
        confirmLabel={t.common.delete}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
