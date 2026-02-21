import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { t } from '../../i18n/es';
import type { RoommateCandidateResponse } from '@rumi/shared';

interface SwipeStackProps {
  candidates: RoommateCandidateResponse[];
  onSwipe: (candidateId: string, action: 'LIKE' | 'PASS') => void;
  onMatch?: (matchId: string) => void;
}

export function SwipeStack({ candidates, onSwipe }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  const currentCandidate = candidates[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentCandidate) return;

    const action = direction === 'right' ? 'LIKE' : 'PASS';
    onSwipe(currentCandidate.id, action);

    if (action === 'LIKE') {
      // TODO: Check response for match, show animation
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentCandidate) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-rumi-text/50">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-lg">{t.roommate.noMoreCandidates}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card stack */}
      <div className="relative h-[480px]">
        <AnimatePresence>
          <SwipeCard
            key={currentCandidate.id}
            candidate={currentCandidate}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-8 mt-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-rumi-danger flex items-center justify-center text-2xl hover:bg-rumi-danger hover:text-white transition-colors"
          aria-label={t.roommate.swipeLeft}
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-rumi-success flex items-center justify-center text-2xl hover:bg-rumi-success hover:text-white transition-colors"
          aria-label={t.roommate.swipeRight}
        >
          ♥
        </button>
      </div>

      {/* Match notification overlay */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            className="fixed inset-0 bg-rumi-accent/90 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMatch(false)}
          >
            <motion.h2
              className="text-5xl font-bold text-white mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              {t.roommate.itsAMatch}
            </motion.h2>
            <motion.button
              className="mt-8 px-8 py-3 bg-white text-rumi-accent rounded-full font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t.roommate.startChat}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
