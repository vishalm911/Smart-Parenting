import { useState, useEffect } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState('seed'); // seed -> tree -> child -> house -> text -> complete

  const messages = [
    'Preparing your next learning adventure...',
    'Opening Literacy Land...',
    'Gathering colorful stars...',
    'Building creative worlds...',
    'Setting up your learning journey...',
    'Almost ready to explore...',
  ];

  const milestones = [
    { id: 1, icon: '🌳', label: 'Alphabet Forest', position: 15 },
    { id: 2, icon: '🦁', label: 'Letter Safari', position: 35 },
    { id: 3, icon: '📚', label: 'Reading Books', position: 55 },
    { id: 4, icon: '⭐', label: 'Collecting Stars', position: 75 },
    { id: 5, icon: '🏆', label: 'Achievement', position: 95 },
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete && onComplete(), 800);
        }
        return Math.min(next, 100);
      });
    }, 30);

    // Phase transitions
    const phaseTimers = [
      setTimeout(() => setPhase('tree'), 500),
      setTimeout(() => setPhase('child'), 1200),
      setTimeout(() => setPhase('mentor'), 1800),
      setTimeout(() => setPhase('house'), 2300),
      setTimeout(() => setPhase('text'), 2800),
    ];

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      phaseTimers.forEach(timer => clearTimeout(timer));
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen ${progress === 100 ? 'fade-out' : ''}`}>
      {/* Background particles */}
      <div className="loading-particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Main story animation */}
      <div className="loading-story">
        {/* Seed sprouting into tree */}
        <div className={`story-seed ${phase !== 'seed' ? 'hidden' : ''}`}>
          <div className="seed-sprout">🌱</div>
        </div>

        {/* Growing tree */}
        <div className={`story-tree ${phase === 'tree' || phase === 'child' || phase === 'mentor' || phase === 'house' || phase === 'text' ? 'visible' : ''}`}>
          <svg viewBox="0 0 200 200" className="tree-svg">
            {/* Tree trunk */}
            <rect x="90" y="100" width="20" height="60" fill="#8B4513" className="tree-trunk" />
            
            {/* Tree leaves/crown */}
            <circle cx="100" cy="100" r="40" fill="#6FBF73" className="tree-crown tree-crown-1" />
            <circle cx="85" cy="90" r="30" fill="#5FB163" className="tree-crown tree-crown-2" />
            <circle cx="115" cy="90" r="30" fill="#7FD583" className="tree-crown tree-crown-3" />
            
            {/* Tree sparkles */}
            <circle cx="80" cy="100" r="3" fill="#F4A300" className="tree-sparkle sparkle-1" />
            <circle cx="120" cy="95" r="3" fill="#FFB84D" className="tree-sparkle sparkle-2" />
            <circle cx="100" cy="80" r="3" fill="#F4A300" className="tree-sparkle sparkle-3" />
          </svg>
        </div>

        {/* Child walking */}
        <div className={`story-child ${phase === 'child' || phase === 'mentor' || phase === 'house' || phase === 'text' ? 'walking' : ''}`}>
          <div className="child-character">👧</div>
          <div className="child-trail">
            <span className="trail-star" style={{ animationDelay: '0s' }}>⭐</span>
            <span className="trail-star" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="trail-star" style={{ animationDelay: '0.4s' }}>⭐</span>
          </div>
        </div>

        {/* Mentor appears */}
        <div className={`story-mentor ${phase === 'mentor' || phase === 'house' || phase === 'text' ? 'visible' : ''}`}>
          <div className="mentor-character">👨‍🏫</div>
          <div className="mentor-glow"></div>
        </div>

        {/* House roof SVG animation */}
        <div className={`story-house ${phase === 'house' || phase === 'text' ? 'visible' : ''}`}>
          <svg viewBox="0 0 300 150" className="house-svg">
            {/* Roof outline with draw animation */}
            <polyline
              points="30,100 150,20 270,100"
              fill="none"
              stroke="#F4A300"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="house-roof-line"
            />
            {/* Roof fill */}
            <polygon
              points="30,100 150,20 270,100"
              fill="#FFB84D"
              opacity="0.3"
              className="house-roof-fill"
            />
            {/* House base */}
            <rect x="80" y="100" width="140" height="40" fill="#FFF9F0" className="house-base" />
            {/* Door */}
            <rect x="130" y="110" width="40" height="30" fill="#F4A300" rx="5" className="house-door" />
          </svg>
        </div>

        {/* SpaceECE text reveal */}
        <div className={`story-text ${phase === 'text' ? 'visible' : ''}`}>
          <div className="text-line">
            <span className="text-char" style={{ animationDelay: '0.1s' }}>S</span>
            <span className="text-char" style={{ animationDelay: '0.2s' }}>p</span>
            <span className="text-char" style={{ animationDelay: '0.3s' }}>a</span>
            <span className="text-char" style={{ animationDelay: '0.4s' }}>c</span>
            <span className="text-char text-char-highlight" style={{ animationDelay: '0.5s' }}>E</span>
            <span className="text-char text-char-highlight" style={{ animationDelay: '0.6s' }}>C</span>
            <span className="text-char text-char-highlight" style={{ animationDelay: '0.7s' }}>E</span>
          </div>
          <div className="text-sparkles">
            <span className="text-sparkle" style={{ left: '10%', animationDelay: '0.3s' }}>✨</span>
            <span className="text-sparkle" style={{ left: '90%', animationDelay: '0.5s' }}>✨</span>
            <span className="text-sparkle" style={{ left: '50%', animationDelay: '0.7s' }}>⭐</span>
          </div>
        </div>
      </div>

      {/* Learning journey path */}
      <div className="loading-journey">
        <svg viewBox="0 0 800 100" className="journey-path-svg" preserveAspectRatio="xMidYMid meet">
          {/* Curved path */}
          <path
            d="M 50 80 Q 200 20, 400 60 T 750 50"
            fill="none"
            stroke="#FFE0B2"
            strokeWidth="8"
            strokeLinecap="round"
            className="journey-path"
          />
          
          {/* Milestones */}
          {milestones.map((milestone) => {
            const x = (milestone.position / 100) * 700 + 50;
            const y = milestone.position < 50 
              ? 80 - ((milestone.position / 50) * 60) + 20
              : 40 + (((milestone.position - 50) / 50) * 20);
            
            return (
              <g key={milestone.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={progress >= milestone.position ? '#F4A300' : '#FFF9F0'}
                  stroke={progress >= milestone.position ? '#FFB84D' : '#E0E0E0'}
                  strokeWidth="3"
                  className={`milestone-circle ${progress >= milestone.position ? 'active' : ''}`}
                />
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  fontSize="20"
                  className="milestone-icon"
                >
                  {milestone.icon}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Character progressing along path */}
        <div 
          className="journey-character"
          style={{
            left: `${Math.min(progress * 0.87, 87)}%`,
            transform: `translateX(-50%) translateY(${
              progress < 50 
                ? -((progress / 50) * 40) 
                : -40 + (((progress - 50) / 50) * 20)
            }px)`
          }}
        >
          🚀
        </div>
      </div>

      {/* Loading message */}
      <div className="loading-message">
        <p className="message-text" key={messageIndex}>
          {messages[messageIndex]}
        </p>
      </div>

      {/* Progress percentage */}
      <div className="loading-percentage">
        {progress}%
      </div>
    </div>
  );
}
