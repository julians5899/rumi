import { motion } from 'framer-motion';
import type { RoommateCandidateResponse } from '@rumi/shared';
import { formatCOP } from '@rumi/shared';
import { t } from '../../i18n/es';

interface SwipeCardProps {
  candidate: RoommateCandidateResponse;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function SwipeCard({ candidate, onSwipe }: SwipeCardProps) {
  const profile = candidate.roommateProfile;

  return (
    <motion.div
      className="absolute w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 150) {
          onSwipe('right');
        } else if (info.offset.x < -150) {
          onSwipe('left');
        }
      }}
      whileDrag={{ rotate: 5 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Avatar / Image */}
      <div className="h-64 bg-gradient-to-br from-rumi-primary to-rumi-accent flex items-center justify-center">
        {candidate.avatarUrl ? (
          <img
            src={candidate.avatarUrl}
            alt={candidate.firstName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl text-white">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-rumi-text">
          {candidate.firstName} {candidate.lastName}
          {profile.age && <span className="text-rumi-text/50 font-normal">, {profile.age}</span>}
        </h3>
        {profile.occupation && (
          <p className="text-rumi-text/60 text-sm mt-1">{profile.occupation}</p>
        )}
        <p className="text-rumi-primary font-semibold mt-2">
          {t.roommate.budget}: {formatCOP(profile.budget)}
        </p>
        <p className="text-sm text-rumi-text/60 mt-1">
          {profile.preferredCity}
          {profile.preferredNeighborhoods.length > 0 &&
            ` - ${profile.preferredNeighborhoods.join(', ')}`}
        </p>
        {profile.bio && (
          <p className="text-sm text-rumi-text/80 mt-3 line-clamp-3">{profile.bio}</p>
        )}
      </div>
    </motion.div>
  );
}
