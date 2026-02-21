interface RumiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
};

export function RumiLogo({ className = '', size = 'md' }: RumiLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Rumi"
      className={`${sizes[size]} w-auto ${className}`}
    />
  );
}
