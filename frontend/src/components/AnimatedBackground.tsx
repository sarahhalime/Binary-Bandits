import React from 'react';
import { motion } from 'framer-motion';

const bubbleColors = [
  'rgba(255,255,255,0.35)',
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.18)',
];

const bubbles = Array.from({ length: 6 }).map((_, i) => ({
  size: Math.random() * 80 + 60,
  left: Math.random() * 80 + '%',
  top: Math.random() * 80 + '%',
  color: 'rgba(255,255,255,0.22)',
  duration: Math.random() * 10 + 12,
  delay: Math.random() * 4,
  blur: Math.random() * 6 + 8,
  opacity: Math.random() * 0.2 + 0.5,
  direction: i % 2 === 0 ? 1 : -1,
  rotate: Math.random() * 10 - 5,
}));

const surferVariants = {
  initial: { x: '-10vw', y: '60vh', rotate: -10 },
  animate: {
    x: '80vw',
    y: ['60vh', '55vh', '65vh', '60vh'],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 18,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export default function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 1, background: 'linear-gradient(135deg, #7f5af0 0%, #2cb67d 100%)' }}
    >
      {/* Bubbles (z-index 1) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, scale: 1, rotate: 0 }}
            animate={{
              y: bubble.direction * 60,
              scale: 1.08,
              rotate: bubble.rotate,
            }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: bubble.duration, delay: bubble.delay, ease: [0.4, 0.0, 0.2, 1] }}
            style={{
              position: 'absolute',
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              background: bubble.color,
              boxShadow: `0 0 40px 10px #fff8`,
              filter: `blur(${bubble.blur}px)`,
              opacity: bubble.opacity,
              zIndex: 1,
              transition: 'background 0.3s',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              overflow: 'hidden',
            }}
          />
        ))}
      </div>
      {/* Cartoon woman surfer SVG (z-index 2) - matches attached image */}
      <motion.div
        variants={surferVariants}
        initial="initial"
        animate="animate"
        style={{ position: 'absolute', zIndex: 2, pointerEvents: 'none' }}
      >
        <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Surfboard - yellow with white flowers */}
          <ellipse cx="110" cy="140" rx="80" ry="18" fill="#ffe066" />
          <ellipse cx="110" cy="140" rx="80" ry="18" fill="#ffe066" />
          <ellipse cx="110" cy="140" rx="80" ry="18" fill="#ffe066" />
          <ellipse cx="60" cy="140" rx="12" ry="6" fill="#fff" />
          <ellipse cx="160" cy="140" rx="14" ry="7" fill="#fff" />
          <ellipse cx="110" cy="140" rx="18" ry="9" fill="#fff" />
        </svg>
      </motion.div>
    </div>
  );
}