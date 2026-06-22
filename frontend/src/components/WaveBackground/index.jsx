import "./WaveBackground.css";

const WaveBackground = () => {
  return (
    <div className="wave-background">
      <svg
        className="waves"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(251, 146, 60, 0.3)" />
            <stop offset="100%" stopColor="rgba(251, 146, 60, 0.1)" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(96, 165, 250, 0.3)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.1)" />
          </linearGradient>
        </defs>

        <g className="wave wave-1">
          <path
            d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
            fill="url(#grad1)"
          />
        </g>

        <g className="wave wave-2">
          <path
            d="M0,350 Q300,250 600,350 T1200,350 L1200,600 L0,600 Z"
            fill="url(#grad2)"
          />
        </g>

        <g className="wave wave-3">
          <path
            d="M0,380 Q300,280 600,380 T1200,380 L1200,600 L0,600 Z"
            fill="url(#grad3)"
          />
        </g>

        <g className="wave wave-4">
          <path
            d="M0,400 Q300,300 600,400 T1200,400 L1200,600 L0,600 Z"
            fill="url(#grad4)"
          />
        </g>
      </svg>
    </div>
  );
};

export default WaveBackground;
