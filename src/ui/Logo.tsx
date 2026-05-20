type Props = { size?: number };
export function Logo({ size = 36 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" aria-label="Lattice logo">
      <defs>
        <radialGradient id="atomG" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#b5fbff" />
          <stop offset="55%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="#0d5663" />
        </radialGradient>
      </defs>
      <g stroke="var(--primary)" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round">
        <line x1="24" y1="78" x2="84" y2="78" />
        <line x1="84" y1="78" x2="84" y2="18" />
        <line x1="84" y1="18" x2="24" y2="18" />
        <line x1="24" y1="18" x2="24" y2="78" />
      </g>
      <g stroke="var(--primary)" strokeOpacity="0.85" strokeWidth="2.8" strokeLinecap="round">
        <line x1="24" y1="78" x2="44" y2="110" />
        <line x1="84" y1="78" x2="104" y2="110" />
        <line x1="84" y1="18" x2="104" y2="50" />
        <line x1="24" y1="18" x2="44" y2="50" />
      </g>
      <g stroke="var(--primary)" strokeWidth="3" strokeLinecap="round">
        <line x1="44" y1="110" x2="104" y2="110" />
        <line x1="104" y1="110" x2="104" y2="50" />
        <line x1="104" y1="50" x2="44" y2="50" />
        <line x1="44" y1="50" x2="44" y2="110" />
      </g>
      <g opacity="0.85">
        <circle cx="24" cy="78" r="7" fill="url(#atomG)" />
        <circle cx="84" cy="78" r="7" fill="url(#atomG)" />
        <circle cx="84" cy="18" r="7" fill="url(#atomG)" />
        <circle cx="24" cy="18" r="7" fill="url(#atomG)" />
      </g>
      <g>
        <circle cx="44" cy="110" r="8.5" fill="url(#atomG)" />
        <circle cx="104" cy="110" r="8.5" fill="url(#atomG)" />
        <circle cx="104" cy="50" r="8.5" fill="url(#atomG)" />
        <circle cx="44" cy="50" r="8.5" fill="url(#atomG)" />
      </g>
    </svg>
  );
}
