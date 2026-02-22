interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

function SkeletonLine({ width, className = '' }: { width?: string; className?: string }) {
  return (
    <div
      className={`h-4 rounded-lg animate-shimmer bg-rumi-primary/[0.06] ${className}`}
      style={{ width: width || '100%' }}
    />
  );
}

export function Skeleton({ variant = 'rect', width, height, lines = 1, className = '' }: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 && lines > 1 ? '70%' : width}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`rounded-full animate-shimmer bg-rumi-primary/[0.06] ${className}`}
        style={{ width: width || '40px', height: height || width || '40px' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl border border-rumi-primary-light/15 overflow-hidden ${className}`}>
        {/* Image placeholder */}
        <div className="h-48 animate-shimmer bg-rumi-primary/[0.06]" />
        {/* Content */}
        <div className="p-4 space-y-3">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
          <div className="pt-1">
            <SkeletonLine width="35%" className="h-6" />
          </div>
          <div className="flex gap-4 pt-1">
            <SkeletonLine width="60px" />
            <SkeletonLine width="60px" />
            <SkeletonLine width="60px" />
          </div>
        </div>
      </div>
    );
  }

  // rect
  return (
    <div
      className={`rounded-xl animate-shimmer bg-rumi-primary/[0.06] ${className}`}
      style={{ width: width || '100%', height: height || '40px' }}
    />
  );
}

export default Skeleton;
