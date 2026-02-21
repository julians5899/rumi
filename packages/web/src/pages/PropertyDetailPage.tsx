import { useParams } from 'react-router-dom';

export function PropertyDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">Detalle de propiedad</h1>
      <p className="text-rumi-text/60">Propiedad: {id}</p>
      {/* TODO: Property detail with images, info, apply button */}
    </div>
  );
}
