interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full overflow-hidden ring-2 ring-white shrink-0
        ${!src ? 'bg-gradient-to-br from-rumi-primary/20 to-rumi-accent/20 flex items-center justify-center font-semibold text-rumi-primary' : ''}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export default Avatar;
