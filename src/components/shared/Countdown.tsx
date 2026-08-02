import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CountdownProps {
  initialCount?: number;
  onComplete?: () => void;
  active?: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  initialCount = 3,
  onComplete,
  active = true,
}) => {
  const [count, setCount] = useState<number | 'GO!'>(initialCount);

  useEffect(() => {
    if (!active) return;
    setCount(initialCount);

    let current = initialCount;
    const timer = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCount(current);
      } else if (current === 0) {
        setCount('GO!');
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [active, initialCount, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={count.toString()}
          initial={{ scale: 0.2, opacity: 0, rotate: -10 }}
          animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
          exit={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="text-center"
        >
          <span className={`font-black text-9xl md:text-[14rem] tracking-tighter uppercase select-none ${
            count === 'GO!'
              ? 'text-cyan-400 text-glow-blue'
              : 'text-purple-400 text-glow-purple'
          }`}>
            {count}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
