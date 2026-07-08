import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { label: 'Reading conversation', delay: 400 },
  { label: 'Looking through sources', delay: 1400 },
  { label: 'Formulating answer', delay: 2800 },
];

const SUBTITLES = [
  'Analyzing context...',
  'Processing your request...',
  'Searching knowledge base...',
  'Connecting the dots...',
];

export function ThinkingUI() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, i) =>
      setTimeout(() => setVisibleSteps((n) => Math.max(n, i + 1)), step.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSubtitleIndex((i) => (i + 1) % SUBTITLES.length), 2000);
    return () => clearInterval(id);
  }, []);

  const allVisible = visibleSteps >= STEPS.length;

  return (
    <div className="flex w-full justify-start gap-3 items-start">
      <img src="/logo.png" alt="AI" className="w-7 h-7 rounded-full mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="text-sm font-medium text-foreground">Thinking</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={subtitleIndex}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-muted-foreground/70 italic ml-3.5"
          >
            {SUBTITLES[subtitleIndex]}
          </motion.span>
        </AnimatePresence>

        {/* Divider */}
        <AnimatePresence>
          {visibleSteps > 0 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-px bg-border/60 my-1 origin-left"
            />
          )}
        </AnimatePresence>

        {/* Steps */}
        <div className="flex flex-col gap-0.5">
          <AnimatePresence>
            {STEPS.slice(0, visibleSteps).map((step, i) => {
              const isActive = i === visibleSteps - 1 && !allVisible;
              const isDone = i < visibleSteps - 1 || allVisible;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  {isDone && !isActive ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="text-xs text-emerald-500 font-bold w-3 text-center shrink-0"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <span className="w-3 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </span>
                  )}
                  <span className={`text-xs ${isDone && !isActive ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                    {step.label}{isActive ? '...' : ''}
                  </span>
                </motion.div>
              );
            })}

            {allVisible && (
              <motion.div
                key="almost-done"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <span className="w-3 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </span>
                <span className="text-xs text-muted-foreground">Almost done...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export const StreamingIndicator = ThinkingUI;
export const MiniSkeleton = ThinkingUI;
