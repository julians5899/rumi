import { t } from '../i18n/es';

export function RoommateSwipePage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.roommate.lookingFor}</h1>
      <p className="text-rumi-text/60 mb-8">Desliza para encontrar tu compañero ideal.</p>
      {/* TODO: SwipeStack with real data from useRoommates hook */}
    </div>
  );
}
