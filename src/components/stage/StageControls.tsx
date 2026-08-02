import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../shared';
import { FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export interface StageControlsProps {
  isRevealed: boolean;
  onToggleReveal: () => void;
  onNextQuestion: () => void;
  onPrevQuestion?: () => void;
  onExit?: () => void;
  hasNext: boolean;
  hasPrev?: boolean;
}

export const StageControls: React.FC<StageControlsProps> = ({
  isRevealed,
  onToggleReveal,
  onNextQuestion,
  onPrevQuestion,
  hasNext,
  hasPrev = false,
}) => {
  return (
    <footer className="w-full max-w-7xl mx-auto z-20 pt-4 flex justify-end">
      {/* Floating Control Dock - Shrinks to fit content */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full sm:w-auto px-6 py-5 rounded-3xl bg-[rgba(15,20,35,0.75)] backdrop-blur-[18px] border border-[rgba(0,255,255,0.18)] shadow-[0_0_30px_rgba(0,255,255,0.12)] flex flex-col sm:flex-row items-center justify-end gap-[18px]"
      >
        {hasPrev && onPrevQuestion && (
          <Button
            variant="glass"
            size="lg"
            leftIcon={<FiArrowLeft />}
            onClick={onPrevQuestion}
            className="w-full sm:w-auto h-[68px] px-6 text-sm font-bold"
          >
            Previous
          </Button>
        )}

        {/* Reveal / Hide Answer Button */}
        <Button
          variant={isRevealed ? 'neon-purple' : 'neon-blue'}
          size="lg"
          leftIcon={isRevealed ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          onClick={onToggleReveal}
          className="w-full sm:w-[300px] h-[68px] font-black uppercase text-base shrink-0 cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.4)]"
        >
          {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
        </Button>

        {/* Next Question / Finish Stage Button */}
        <Button
          variant="host-stage"
          size="lg"
          rightIcon={<FiArrowRight className="w-5 h-5 fill-current" />}
          onClick={onNextQuestion}
          className="w-full sm:w-[300px] h-[68px] font-black uppercase text-base shrink-0 cursor-pointer shadow-[0_0_30px_rgba(0,240,255,0.5)]"
        >
          {hasNext ? 'Next Question' : 'Finish Stage'}
        </Button>
      </motion.div>
    </footer>
  );
};
