export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <svg viewBox="0 0 64 64" aria-hidden>
        <rect x="6" y="20" width="52" height="24" rx="7" fill="#f5b301" />
        <path d="M6 30 L20 30 L20 20 L44 20 L52 30 L58 30 L58 34 L6 34 Z" fill="#ffd35c" />
        <rect x="24" y="24" width="10" height="7" rx="2" fill="#0b0f14" />
        <rect x="38" y="24" width="9" height="7" rx="2" fill="#0b0f14" />
        <circle cx="19" cy="46" r="7" fill="#0b0f14" />
        <circle cx="19" cy="46" r="3" fill="#cfd3d6" />
        <circle cx="46" cy="46" r="7" fill="#0b0f14" />
        <circle cx="46" cy="46" r="3" fill="#cfd3d6" />
      </svg>
      {!compact && <span>Karavan Stüdyo</span>}
    </div>
  );
}
