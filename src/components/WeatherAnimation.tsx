import type { WeatherCondition } from '../types/weather';

interface Props {
  condition: WeatherCondition;
  size?: number;
}

const RAIN_DROPS = [
  { x: 22, delay: 0 },
  { x: 34, delay: 0.25 },
  { x: 46, delay: 0.6 },
  { x: 58, delay: 0.1 },
  { x: 70, delay: 0.45 },
  { x: 80, delay: 0.75 },
];

const SNOW_FLAKES = [
  { x: 20, delay: 0, r: 3.5 },
  { x: 35, delay: 1.0, r: 2.5 },
  { x: 50, delay: 0.4, r: 4 },
  { x: 65, delay: 1.5, r: 2.5 },
  { x: 80, delay: 0.8, r: 3 },
];

function CloudShape({ cx = 50, cy = 38, fill = '#90A4AE' }: { cx?: number; cy?: number; fill?: string }) {
  return (
    <g>
      <circle cx={cx - 14} cy={cy + 6} r={13} fill={fill} />
      <circle cx={cx + 0} cy={cy + 6} r={13} fill={fill} />
      <circle cx={cx + 14} cy={cy + 6} r={13} fill={fill} />
      <circle cx={cx - 7} cy={cy - 2} r={13} fill={fill} />
      <circle cx={cx + 7} cy={cy - 2} r={13} fill={fill} />
      <rect x={cx - 27} y={cy + 6} width={54} height={18} fill={fill} rx={3} />
    </g>
  );
}

function SunRays({ cx = 50, cy = 50 }: { cx?: number; cy?: number }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <>
      {angles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={cx + Math.cos(rad) * 27}
            y1={cy + Math.sin(rad) * 27}
            x2={cx + Math.cos(rad) * 40}
            y2={cy + Math.sin(rad) * 40}
            stroke="#FFD54F"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

export default function WeatherAnimation({ condition, size = 100 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {condition === 'sunny' && (
        <g className="sun-rotate">
          <SunRays />
          <circle cx="50" cy="50" r="22" fill="#FFD54F" />
          <circle cx="50" cy="50" r="22" fill="#FFB300" opacity="0.25" />
        </g>
      )}

      {condition === 'partly-cloudy' && (
        <g>
          <g className="sun-rotate" style={{ transformOrigin: '38px 58px' }}>
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={38 + Math.cos(rad) * 19}
                  y1={58 + Math.sin(rad) * 19}
                  x2={38 + Math.cos(rad) * 28}
                  y2={58 + Math.sin(rad) * 28}
                  stroke="#FFD54F"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx="38" cy="58" r="15" fill="#FFD54F" />
          </g>
          <g className="cloud-float">
            <CloudShape cx={56} cy={38} fill="white" />
            <CloudShape cx={56} cy={38} fill="#ECEFF1" />
          </g>
        </g>
      )}

      {(condition === 'cloudy' || condition === 'storm') && (
        <g className="cloud-float">
          <CloudShape cx={50} cy={40} fill="#B0BEC5" />
          <CloudShape cx={50} cy={40} fill="#90A4AE" />
        </g>
      )}

      {condition === 'rainy' && (
        <g>
          <CloudShape cx={50} cy={32} fill="#607D8B" />
          {RAIN_DROPS.map((drop) => (
            <line
              key={drop.x}
              x1={drop.x}
              y1={60}
              x2={drop.x - 4}
              y2={76}
              stroke="#64B5F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="rain-drop"
              style={{ animationDelay: `${drop.delay}s` }}
            />
          ))}
        </g>
      )}

      {condition === 'snowy' && (
        <g>
          <CloudShape cx={50} cy={32} fill="#B0BEC5" />
          {SNOW_FLAKES.map((flake) => (
            <circle
              key={flake.x}
              cx={flake.x}
              cy={65}
              r={flake.r}
              fill="white"
              stroke="#90CAF9"
              strokeWidth="1.5"
              className="snow-flake"
              style={{ animationDelay: `${flake.delay}s` }}
            />
          ))}
        </g>
      )}

      {condition === 'windy' && (
        <g>
          <CloudShape cx={52} cy={30} fill="#90A4AE" />
          <g className="wind-lines">
            <path d="M 8 62 Q 30 56 52 62 Q 72 68 92 62" stroke="#90CAF9" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 12 73 Q 34 67 56 73 Q 76 79 96 73" stroke="#90CAF9" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 5 84 Q 27 78 49 84 Q 69 90 89 84" stroke="#90CAF9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
          </g>
        </g>
      )}
    </svg>
  );
}
