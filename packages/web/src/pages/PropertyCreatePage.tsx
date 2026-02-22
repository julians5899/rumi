import { useState, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { Skeleton } from '../components/ui/Skeleton';
import { IconBuilding, IconMoney, IconMapPin, IconCheck } from '../components/ui/Icons';

const PropertyMap = lazy(() => import('../components/ui/PropertyMap'));

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  address: string;
  city: string;
  neighborhood: string;
  department: string;
  amenities: string[];
}

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO'] as const;
const LISTING_TYPES = ['RENT', 'SALE'] as const;
const AMENITIES = [
  'wifi', 'parking', 'laundry', 'gym', 'pool', 'security',
  'elevator', 'furnished', 'pets_allowed', 'balcony', 'air_conditioning', 'hot_water',
] as const;

const DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlantico', 'Bogota D.C.', 'Bolivar',
  'Boyaca', 'Caldas', 'Caqueta', 'Casanare', 'Cauca', 'Cesar', 'Choco',
  'Cordoba', 'Cundinamarca', 'Guainia', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindio',
  'Risaralda', 'San Andres y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupes', 'Vichada',
];

const DEFAULT_CENTER: [number, number] = [4.6486, -74.0628];

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-rumi-primary-light/30 bg-white text-sm text-rumi-text placeholder:text-rumi-text/30 focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all duration-200';

const labelClass = 'block text-sm font-medium text-rumi-text/70 mb-1.5';

export function PropertyCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [geocoding, setGeocoding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PropertyFormData>({
    defaultValues: {
      propertyType: 'APARTMENT',
      listingType: 'RENT',
      city: '',
      department: '',
      amenities: [],
    },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    );
  };

  const handleGeocode = async () => {
    const address = getValues('address');
    const city = getValues('city');
    const department = getValues('department');
    if (!address || !city) return;

    setGeocoding(true);
    try {
      const query = `${address}, ${city}, ${department || ''}, Colombia`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'RumiApp/1.0 (rumi-rental-platform)' } },
      );
      const results = await response.json();
      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        setPinPosition([lat, lon]);
        setMapCenter([lat, lon]);
      }
    } catch {
      // Silently fail — user can still click on the map
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPinPosition([lat, lng]);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        listingType: data.listingType,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        area: data.area ? Number(data.area) : undefined,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood || undefined,
        department: data.department,
        latitude: pinPosition ? pinPosition[0] : undefined,
        longitude: pinPosition ? pinPosition[1] : undefined,
        amenities: selectedAmenities,
      };

      const res = await apiClient.post<{ id: string }>('/properties', payload);
      navigate(`/properties/${res.data.id}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t.common.error;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={t.nav.publishProperty}
        subtitle={t.property.createSubtitle}
        backTo="/properties"
      />

      <ErrorAlert message={error} className="mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card variant="bordered" padding="md" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
              <IconBuilding className="w-4 h-4 text-rumi-primary" />
            </div>
            <h2 className="text-lg font-semibold text-rumi-text">Informacion basica</h2>
          </div>

          <div>
            <label className={labelClass}>{t.property.title} *</label>
            <input
              {...register('title', { required: 'Requerido', minLength: { value: 5, message: 'Minimo 5 caracteres' }, maxLength: 200 })}
              className={inputClass}
              placeholder="Ej: Hermoso apartamento en Chapinero"
            />
            {errors.title && <p className="text-xs text-rumi-danger mt-1.5">{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelClass}>{t.property.description} *</label>
            <textarea
              {...register('description', { required: 'Requerido', minLength: { value: 20, message: 'Minimo 20 caracteres' }, maxLength: 5000 })}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Describe tu inmueble con detalle..."
            />
            {errors.description && <p className="text-xs text-rumi-danger mt-1.5">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t.property.type} *</label>
              <select {...register('propertyType', { required: true })} className={`${inputClass} appearance-none`}>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{t.property.types[pt]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.property.listingType} *</label>
              <select {...register('listingType', { required: true })} className={`${inputClass} appearance-none`}>
                {LISTING_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{t.property.listingTypes[lt]}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Price & Specs */}
        <Card variant="bordered" padding="md" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
              <IconMoney className="w-4 h-4 text-rumi-primary" />
            </div>
            <h2 className="text-lg font-semibold text-rumi-text">Precio y caracteristicas</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>{t.property.price} (COP) *</label>
              <input
                type="number"
                {...register('price', { required: 'Requerido', min: { value: 1, message: 'Debe ser mayor a 0' } })}
                className={inputClass}
                placeholder="Ej: 2500000"
              />
              {errors.price && <p className="text-xs text-rumi-danger mt-1.5">{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelClass}>{t.property.bedrooms} *</label>
              <input
                type="number"
                min={0}
                max={20}
                {...register('bedrooms', { required: 'Requerido', min: 0, max: 20 })}
                className={inputClass}
                placeholder="3"
              />
              {errors.bedrooms && <p className="text-xs text-rumi-danger mt-1.5">{errors.bedrooms.message}</p>}
            </div>
            <div>
              <label className={labelClass}>{t.property.bathrooms} *</label>
              <input
                type="number"
                min={1}
                max={10}
                {...register('bathrooms', { required: 'Requerido', min: 1, max: 10 })}
                className={inputClass}
                placeholder="2"
              />
              {errors.bathrooms && <p className="text-xs text-rumi-danger mt-1.5">{errors.bathrooms.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.property.area}</label>
            <input
              type="number"
              {...register('area')}
              className={inputClass}
              placeholder="Ej: 85"
            />
          </div>
        </Card>

        {/* Location */}
        <Card variant="bordered" padding="md" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
              <IconMapPin className="w-4 h-4 text-rumi-primary" />
            </div>
            <h2 className="text-lg font-semibold text-rumi-text">Ubicacion</h2>
          </div>

          <div>
            <label className={labelClass}>{t.property.address} *</label>
            <input
              {...register('address', { required: 'Requerido', minLength: { value: 5, message: 'Minimo 5 caracteres' } })}
              className={inputClass}
              placeholder="Ej: Calle 63 #7-20"
            />
            {errors.address && <p className="text-xs text-rumi-danger mt-1.5">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t.property.city} *</label>
              <input
                {...register('city', { required: 'Requerido', minLength: 2 })}
                className={inputClass}
                placeholder="Ej: Bogota"
              />
              {errors.city && <p className="text-xs text-rumi-danger mt-1.5">{errors.city.message}</p>}
            </div>
            <div>
              <label className={labelClass}>{t.property.neighborhood}</label>
              <input
                {...register('neighborhood')}
                className={inputClass}
                placeholder="Ej: Chapinero Alto"
              />
            </div>
            <div>
              <label className={labelClass}>{t.property.department} *</label>
              <select
                {...register('department', { required: 'Requerido' })}
                className={`${inputClass} appearance-none`}
              >
                <option value="">-- Seleccionar --</option>
                {DEPARTMENTS.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-rumi-danger mt-1.5">{errors.department.message}</p>}
            </div>
          </div>

          {/* Map Pin */}
          <div className="mt-2">
            <div className="flex items-center gap-3 mb-2">
              <label className="block text-sm font-medium text-rumi-text/70">{t.map.location}</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGeocode}
                loading={geocoding}
              >
                {t.map.searchOnMap}
              </Button>
            </div>
            <p className="text-xs text-rumi-text/40 mb-2">{t.map.clickToPlace}</p>
            <div className="rounded-xl overflow-hidden border-2 border-rumi-primary-light/20">
              <Suspense fallback={<Skeleton variant="rect" className="!h-[250px]" />}>
                <PropertyMap
                  markers={pinPosition ? [{
                    id: 'new-property',
                    position: pinPosition,
                    title: getValues('title') || t.map.newPin,
                  }] : []}
                  center={mapCenter}
                  zoom={13}
                  height="250px"
                  onMapClick={handleMapClick}
                />
              </Suspense>
            </div>
            {pinPosition && (
              <p className="text-xs text-rumi-text/40 mt-1.5">
                {t.map.coordinates}: {pinPosition[0].toFixed(6)}, {pinPosition[1].toFixed(6)}
              </p>
            )}
          </div>
        </Card>

        {/* Amenities */}
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
              <IconCheck className="w-4 h-4 text-rumi-primary" />
            </div>
            <h2 className="text-lg font-semibold text-rumi-text">{t.property.amenities}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className="text-left"
                >
                  <Badge
                    variant={isSelected ? 'primary' : 'neutral'}
                    size="md"
                    icon={isSelected ? <IconCheck className="w-3.5 h-3.5" /> : undefined}
                    className={`w-full justify-start cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-rumi-primary/20'
                        : 'hover:ring-2 hover:ring-rumi-primary-light/30'
                    }`}
                  >
                    {t.property.amenityLabels[amenity as keyof typeof t.property.amenityLabels] || amenity}
                  </Badge>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1" size="lg">
            {saving ? t.property.publishing : t.nav.publishProperty}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} size="lg">
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
