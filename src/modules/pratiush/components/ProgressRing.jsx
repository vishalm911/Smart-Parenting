import { useEffect, useRef } from 'react';
import './ProgressRing.css';

export default function ProgressRing({ percent = 0, size = 120, stroke = 10, color, label }) {
  const circleRef = useRef(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const resolvedColor = color || (
    percent < 33 ? '#EF5350' : percent < 66 ? '#FFA726' : '#66BB6A'
  );

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.setProperty('--circumference', circumference);
    circle.style.setProperty('--offset', offset);
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        circle.style.strokeDashoffset = offset;
      });
    });
  }, [circumference, offset]);

  return (
    <div className="progress-ring-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="progress-ring-bg"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
        />
        <circle
          ref={circleRef}
          className="progress-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
          stroke={resolvedColor}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-content">
        <span className="progress-ring-percent">{Math.round(percent)}%</span>
        {label && <span className="progress-ring-label">{label}</span>}
      </div>
    </div>
  );
}
