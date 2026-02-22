import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { IconFilter, IconMap, IconGrid, IconPlus, IconBed, IconBath, IconArea, IconBuilding } from '../components/ui/Icons';

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
  isViewed?: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  city: string;
  propertyType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
}

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO'] as const;
const LISTING_TYPES = ['RENT', 'SALE'] as const;

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('es-CO');
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border-2 border-rumi-primary-light/30 rounded-xl focus:ring-4 focus:ring-rumi-primary/10 focus:border-rumi-primary focus:outline-none transition-all duration-200 bg-white text-rumi-text placeholder:text-rumi-text/30';

export function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    city: '',
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [page, setPage] = useState(1);

  const fetchProperties = async (pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '12');
      if (filters.city) params.set('city', filters.city);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.listingType) params.set('listingType', filters.listingType);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

      const res = await apiClient.get<{ data: Property[]; pagination: Pagination }>(
        `/properties?${params.toString()}`,
      );
      setProperties(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchProperties(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ city: '', propertyType: '', listingType: '', minPrice: '', maxPrice: '' });
    setPage(1);
    setTimeout(() => fetchProperties(1), 0);
  };

  const handleFilterChange = (field: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div>
      <PageHeader
        title={t.nav.properties}
        subtitle={t.property.browseSubtitle}
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<IconFilter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {t.common.filter} {showFilters ? '\u25B2' : '\u25BC'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={viewMode === 'grid' ? <IconMap className="w-4 h-4" /> : <IconGrid className="w-4 h-4" />}
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            >
              {viewMode === 'grid' ? t.map.mapView : t.map.listView}
            </Button>
            <Link to="/properties/new">
              <Button variant="primary" size="sm" icon={<IconPlus className="w-4 h-4" />}>
                {t.nav.publishProperty}
              </Button>
            </Link>
          </>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <Card variant="bordered" padding="md" className="mb-6 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-rumi-text/50 mb-1.5">{t.property.city}</label>
              <input
                value={filters.city}
                onChange={handleFilterChange('city')}
                className={inputClass}
                placeholder="Ej: Bogota"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-rumi-text/50 mb-1.5">{t.property.type}</label>
              <select
                value={filters.propertyType}
                onChange={handleFilterChange('propertyType')}
                className={`${inputClass} appearance-none`}
              >
                <option value="">{t.property.allTypes}</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{t.property.types[pt]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-rumi-text/50 mb-1.5">{t.property.listingType}</label>
              <select
                value={filters.listingType}
                onChange={handleFilterChange('listingType')}
                className={`${inputClass} appearance-none`}
              >
                <option value="">{t.property.allListings}</option>
                {LISTING_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{t.property.listingTypes[lt]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-rumi-text/50 mb-1.5">{t.property.minPrice}</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={handleFilterChange('minPrice')}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-rumi-text/50 mb-1.5">{t.property.maxPrice}</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={handleFilterChange('maxPrice')}
                className={inputClass}
                placeholder="10,000,000"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="sm" onClick={handleApplyFilters}>
              {t.common.search}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              {t.property.clearFilters}
            </Button>
          </div>
        </Card>
      )}

      {/* Error */}
      <ErrorAlert message={error} className="mb-6" />

      {/* Loading — Skeleton cards */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <EmptyState
          icon={<IconBuilding className="w-10 h-10" />}
          title={t.property.noProperties}
          description="No hay propiedades que coincidan con tus filtros"
          action={{ label: t.nav.publishProperty, to: '/properties/new' }}
        />
      )}

      {/* Map View */}
      {!loading && properties.length > 0 && viewMode === 'map' && (
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <Suspense fallback={<div className="h-[500px] animate-shimmer" />}>
            <PropertyMap
              markers={properties
                .filter((p) => p.latitude && p.longitude)
                .map((p) => ({
                  id: p.id,
                  position: [Number(p.latitude), Number(p.longitude)] as [number, number],
                  title: p.title,
                  price: `$${formatPrice(p.price)} ${p.currency}${p.listingType === 'RENT' ? t.property.perMonth : ''}`,
                  link: `/properties/${p.id}`,
                }))}
              fitBounds
              height="500px"
            />
          </Suspense>
        </Card>
      )}

      {/* Grid View */}
      {!loading && properties.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {properties.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`} className="block group">
              <Card variant="interactive" padding="none" className="overflow-hidden h-full">
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-rumi-primary/5 to-rumi-accent/5 relative overflow-hidden">
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconBuilding className="w-12 h-12 text-rumi-primary/20" />
                    </div>
                  )}
                  {/* Listing type badge */}
                  <Badge
                    variant={property.listingType === 'RENT' ? 'primary' : 'accent'}
                    size="sm"
                    className="absolute top-3 left-3 shadow-sm"
                  >
                    {t.property.listingTypes[property.listingType as 'RENT' | 'SALE']}
                  </Badge>
                  {/* Property type badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-rumi-text shadow-sm">
                    {t.property.types[property.propertyType as 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO']}
                  </span>
                  {/* Viewed badge */}
                  {property.isViewed && (
                    <Badge variant="neutral" size="sm" className="absolute bottom-3 left-3 bg-black/50 text-white">
                      &#10003; {t.property.viewed}
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-rumi-text truncate">{property.title}</h3>
                  <p className="text-sm text-rumi-text/40 mt-1 truncate">
                    {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
                  </p>

                  {/* Price */}
                  <p className="text-lg font-bold text-rumi-primary mt-2">
                    ${formatPrice(property.price)}{' '}
                    <span className="text-sm font-normal text-rumi-text/40">
                      {property.currency}{property.listingType === 'RENT' ? t.property.perMonth : ''}
                    </span>
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-rumi-text/50">
                    <span className="flex items-center gap-1.5">
                      <IconBed className="w-4 h-4" /> {property.bedrooms} {t.property.beds}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconBath className="w-4 h-4" /> {property.bathrooms} {t.property.baths}
                    </span>
                    {property.area && (
                      <span className="flex items-center gap-1.5">
                        <IconArea className="w-4 h-4" /> {Number(property.area)} m&sup2;
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            {t.common.previous}
          </Button>
          <span className="text-sm text-rumi-text/50 font-medium">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            {t.common.next}
          </Button>
        </div>
      )}
    </div>
  );
}
