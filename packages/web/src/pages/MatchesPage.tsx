import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../i18n/es';
import apiClient from '../services/api-client';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { IconHeart, IconMessage, IconMapPin } from '../components/ui/Icons';

interface RoommateProfile {
  budget: number | string;
  preferredCity: string;
  bio: string | null;
  occupation: string | null;
  age: number | null;
}

interface MatchedUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  roommateProfile: RoommateProfile | null;
}

interface Match {
  id: string;
  createdAt: string;
  matchedUser: MatchedUser;
  conversationId: string | null;
}

function formatBudget(budget: number | string): string {
  return Number(budget).toLocaleString('es-CO');
}

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unmatchingId, setUnmatchingId] = useState<string | null>(null);
  const [confirmUnmatch, setConfirmUnmatch] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<Match[]>('/matches');
      setMatches(res.data);
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleUnmatch = async (matchId: string) => {
    setUnmatchingId(matchId);
    try {
      await apiClient.delete(`/matches/${matchId}`);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      setConfirmUnmatch(null);
    } catch {
      setError(t.common.error);
    } finally {
      setUnmatchingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t.nav.matches}
        subtitle={matches.length > 0 ? `${matches.length} match${matches.length === 1 ? '' : 'es'}` : undefined}
        action={
          <Link to="/roommates">
            <Button variant="primary" size="sm" icon={<IconHeart className="w-4 h-4" />}>
              {t.roommate.goSwipe}
            </Button>
          </Link>
        }
      />

      <ErrorAlert message={error} className="mb-6" />

      {loading && <LoadingState text={t.common.loading} />}

      {!loading && matches.length === 0 && (
        <EmptyState
          icon={<IconHeart className="w-10 h-10" />}
          title={t.roommate.noMatches}
          description={t.roommate.noMatchesSubtitle}
          action={{ label: t.roommate.goSwipe, to: '/roommates' }}
        />
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-4 stagger-children">
          {matches.map((match) => (
            <Card key={match.id} variant="elevated" padding="none" className="overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                <Avatar
                  src={match.matchedUser.avatarUrl}
                  name={`${match.matchedUser.firstName} ${match.matchedUser.lastName}`}
                  size="lg"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-rumi-text">
                    {match.matchedUser.firstName} {match.matchedUser.lastName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {match.matchedUser.roommateProfile?.age && (
                      <span className="text-xs text-rumi-text/40">
                        {match.matchedUser.roommateProfile.age} {t.profile.yearsOld}
                      </span>
                    )}
                    {match.matchedUser.roommateProfile?.occupation && (
                      <span className="text-xs text-rumi-text/40">
                        &bull; {match.matchedUser.roommateProfile.occupation}
                      </span>
                    )}
                    {match.matchedUser.roommateProfile?.preferredCity && (
                      <Badge variant="neutral" size="sm" icon={<IconMapPin className="w-3 h-3" />}>
                        {match.matchedUser.roommateProfile.preferredCity}
                      </Badge>
                    )}
                  </div>

                  {match.matchedUser.roommateProfile && (
                    <p className="text-sm text-rumi-primary font-medium mt-1">
                      ${formatBudget(match.matchedUser.roommateProfile.budget)} /mes
                    </p>
                  )}

                  {match.matchedUser.roommateProfile?.bio && (
                    <p className="text-sm text-rumi-text/50 mt-1.5 line-clamp-2">
                      {match.matchedUser.roommateProfile.bio}
                    </p>
                  )}

                  <p className="text-xs text-rumi-text/25 mt-2">
                    {t.roommate.matchDate} {new Date(match.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions bar */}
              <div className="bg-rumi-bg/50 px-5 py-3 flex items-center justify-between border-t border-rumi-primary-light/10">
                {match.conversationId ? (
                  <Link to={`/messages/${match.conversationId}`}>
                    <Button variant="primary" size="sm" icon={<IconMessage className="w-4 h-4" />}>
                      {t.roommate.startChat}
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-rumi-text/25">&mdash;</span>
                )}

                <button
                  onClick={() => setConfirmUnmatch(match.id)}
                  className="text-xs text-rumi-text/25 hover:text-red-400 transition-colors"
                >
                  {t.roommate.unmatch}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Unmatch Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmUnmatch}
        onClose={() => setConfirmUnmatch(null)}
        onConfirm={() => confirmUnmatch && handleUnmatch(confirmUnmatch)}
        title={t.roommate.unmatch}
        message={t.roommate.unmatchConfirm}
        confirmLabel={t.roommate.unmatch}
        variant="danger"
        loading={unmatchingId !== null}
      />
    </div>
  );
}
