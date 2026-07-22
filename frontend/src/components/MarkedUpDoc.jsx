function MarkedUpDoc() {
  return (
    <svg viewBox="0 0 400 500" className="w-full max-w-sm mx-auto drop-shadow-2xl">
      <rect x="0" y="0" width="400" height="500" rx="6" fill="#FAF7EE" />
      <rect x="40" y="40" width="150" height="11" rx="2" fill="#B9B29A" />
      <rect x="40" y="62" width="95" height="7" rx="2" fill="#D8D3C2" />

      <rect x="40" y="104" width="320" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="122" width="300" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="140" width="260" height="8" rx="2" fill="#E4DFCE" />

      {/* highlighted risky clause */}
      <rect x="36" y="170" width="292" height="38" rx="3" fill="#E8A33D" opacity="0.4" />
      <rect x="40" y="177" width="280" height="8" rx="2" fill="#7A6947" />
      <rect x="40" y="194" width="185" height="8" rx="2" fill="#7A6947" />

      <rect x="40" y="228" width="320" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="246" width="230" height="8" rx="2" fill="#E4DFCE" />

      {/* redlined clause */}
      <rect x="40" y="278" width="300" height="8" rx="2" fill="#7A6947" />
      <path
        d="M40 292 q6 6 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0"
        stroke="#C1443C"
        strokeWidth="2.5"
        fill="none"
      />

      <rect x="40" y="316" width="300" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="334" width="250" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="352" width="280" height="8" rx="2" fill="#E4DFCE" />
      <rect x="40" y="370" width="200" height="8" rx="2" fill="#E4DFCE" />

      <line x1="40" y1="432" x2="150" y2="432" stroke="#B9B29A" strokeWidth="1.5" />
      <line x1="220" y1="432" x2="330" y2="432" stroke="#B9B29A" strokeWidth="1.5" />
      <rect x="40" y="442" width="60" height="6" rx="2" fill="#D8D3C2" />
      <rect x="220" y="442" width="60" height="6" rx="2" fill="#D8D3C2" />

      {/* stamp */}
      <g transform="translate(300,66) rotate(-14)">
        <circle cx="0" cy="0" r="48" fill="none" stroke="#C1443C" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x="0" y="-6" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fontWeight="700" fill="#C1443C">RISK</text>
        <text x="0" y="11" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="14" fontWeight="700" fill="#C1443C">HIGH</text>
      </g>
    </svg>
  );
}
export default MarkedUpDoc;
