interface FlagIconProps {
  country: 'en' | 'bg';
  className?: string;
}

export function FlagIcon({ country, className = "w-4 h-4" }: FlagIconProps) {
  if (country === 'en') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        {/* English flag - Union Jack */}
        <rect width="24" height="24" fill="#012169" />
        {/* White cross */}
        <rect x="0" y="10" width="24" height="4" fill="#FFFFFF" />
        <rect x="10" y="0" width="4" height="24" fill="#FFFFFF" />
        {/* Red cross */}
        <rect x="0" y="11" width="24" height="2" fill="#C8102E" />
        <rect x="11" y="0" width="2" height="24" fill="#C8102E" />
        {/* Diagonal white stripes */}
        <path d="M0 0 L24 24 M24 0 L0 24" stroke="#FFFFFF" strokeWidth="2" />
        {/* Diagonal red stripes */}
        <path d="M0 0 L24 24 M24 0 L0 24" stroke="#C8102E" strokeWidth="1" />
      </svg>
    );
  }
  
  if (country === 'bg') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        {/* Bulgarian flag - tricolor */}
        <rect width="24" height="24" fill="#00966E" />
        <rect x="0" y="8" width="24" height="8" fill="#FFFFFF" />
        <rect x="0" y="16" width="24" height="8" fill="#D62612" />
      </svg>
    );
  }
  
  return null;
} 