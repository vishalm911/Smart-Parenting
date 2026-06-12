import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

/**
 * Full-screen confetti celebration effect.
 */
export default function ConfettiEffect({ active = false, duration = 3000 }) {
  const [show, setShow] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (active) {
      Promise.resolve().then(() => {
        setShow(true);
      });
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!show) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={250}
      gravity={0.15}
      colors={['#F5A623', '#FF6B9D', '#7C4DFF', '#2EC4B6', '#4FC3F7', '#FFD180', '#66BB6A']}
      recycle={false}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
