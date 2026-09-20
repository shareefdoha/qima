export default function Logo({ className = 'h-10 w-10', dark = false }) {
  const shell = dark ? '#ffffff' : '#0b1e36';
  const mark = '#c32b41';
  const letter = dark ? '#0b1e36' : '#ffffff';

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="QIMA emblem">
      <rect width="64" height="64" rx="14" fill={shell} />
      <path d="M32 11 L51 21.5 V42.5 L32 53 L13 42.5 V21.5 Z" fill="none" stroke={mark} strokeWidth="2.5" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Urbanist, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill={letter}
      >
        Q
      </text>
    </svg>
  );
}
