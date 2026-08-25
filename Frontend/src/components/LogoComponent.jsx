import { Link } from 'react-router-dom';

export default function LogoComponent({
  className = '',
  height = 'h-10 sm:h-12',
  textSize = 'text-2xl sm:text-[28px]',
  useThemeColor = true,
  showText = true,
}) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 group hover:opacity-95 transition-all duration-300 ${className}`}>
      {/* SVG Emblem Badge (PACK + D + S) */}
      <svg
        viewBox="0 0 210 150"
        className={`${height} w-auto object-contain shrink-0`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logo-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.22" />
          </filter>
          <linearGradient id="d-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Left: Vertical 'PACK' */}
        <text
          x="-75"
          y="35"
          fill="#0f172a"
          fontFamily="Impact, Arial Black, 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontSize="44"
          letterSpacing="4"
          transform="rotate(-90)"
          textAnchor="middle"
          filter="url(#logo-shadow)"
        >
          PACK
        </text>

        {/* Right: Bold 'D' Emblem */}
        <path
          d="M 52 10 H 122 C 160 10 190 34 190 75 C 190 116 160 140 122 140 H 52 V 10 Z M 80 34 V 116 H 118 C 142 116 160 100 160 75 C 160 50 142 34 118 34 H 80 Z"
          fill={useThemeColor ? 'currentColor' : 'url(#d-blue-gradient)'}
          className={useThemeColor ? 'text-primary' : ''}
          filter="url(#logo-shadow)"
        />

        {/* Overlapping 'S' Emblem */}
        <path
          d="M 140 48 C 132 38 116 36 104 42 C 92 47 88 57 94 65 C 99 72 112 76 124 80 C 140 85 150 93 148 107 C 145 122 126 131 108 129 C 93 127 82 117 79 107 L 98 100 C 100 106 108 112 117 112 C 127 112 133 106 132 100 C 131 93 121 90 109 85 C 94 79 84 72 87 56 C 89 40 107 30 125 30 C 142 30 153 38 156 48 L 140 48 Z"
          fill="#0f172a"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#logo-shadow)"
        />
      </svg>

      {/* Right Side Brand Text: DSoft (Blue) + Pack (Black) */}
      {showText && (
        <div className={`flex items-center tracking-tight font-extrabold font-display-lg whitespace-nowrap ${textSize}`}>
          <span className="text-primary">DSoft</span>
          <span className="text-secondary ml-1">Pack</span>
        </div>
      )}
    </Link>
  );
}
