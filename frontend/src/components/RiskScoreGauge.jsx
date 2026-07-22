export default function RiskScoreGauge({ score }) {
  const getColor = () => {
    if (score >= 60) return "#cb261a";
    if (score >= 30) return "#EAB308";
    return "#468a5b";
  };
  const getLabel = () => {
    if (score >= 60) return "High Risk";
    if (score >= 30) return "Medium Risk";
    return "Low Risk";
  };
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="text-center p-3 border-2 border-dashed border-seal rounded-full -rotate-3">
      <svg width="160" height="160" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#E4DFCE" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={getColor()} 
          strokeWidth="8"
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          className="transition-all duration-1000 ease-out"
        >
          <animate 
              attributeName="stroke-dashoffset" 
              from={circumference} 
              to={offset} 
              dur="1.5s" 
              fill="freeze" 
            />
          </circle>
        <text x="50" y="47" textAnchor="middle" fontSize="23" fontWeight="600" fontFamily="'IBM Plex Mono', monospace" fill={getColor()}>{score}</text>
        <text x="50" y="63" textAnchor="middle" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fill="#707068">/ 100</text>
      </svg>
      <p className="font-mono font-semibold text-xs tracking-wider uppercase mt-1" style={{ color: getColor() }}>
        {getLabel()}
      </p>
    </div>
  );
}