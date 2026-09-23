import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { useSparks } from '../hooks/usesparks';
import { useMembership } from '../hooks/usemembership';
import { supabase } from '../api/supabase';
import { PageWrapper } from '../components/layout';
import { Card, Spinner, Button } from '../components/ui';
import { SparksAllowanceDisplay, MembershipBadge } from '../components/membership';
import { SparkFilledIcon, BookOpenIcon, HeartIcon } from '../assets/icons';
import type { Story } from '../types/story';

export function ReaderProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { balance, ledger, loading: sparksLoading } = useSparks();
  const { tier, allowance, nextGrantAt } = useMembership();

  const [library, setLibrary] = useState<Story[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('library_entries')
        .select('story:stories(*)')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .limit(12);
      setLibrary((data ?? []).map((d: any) => d.story).filter(Boolean));
      setLibraryLoading(false);
    })();
  }, [user]);

  if (authLoading || sparksLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !profile) return <Navigate to="/signin" replace />;

  return (
    <PageWrapper
      title={profile.display_name}
      subtitle={`@${profile.username}`}
      action={
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Sparks allowance */}
        <SparksAllowanceDisplay
          variant="expanded"
          balance={balance}
          allowance={allowance}
          tier={tier}
          nextGrantAt={nextGrantAt}
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<BookOpenIcon size={20} className="text-primary-600" />}
            label="In your library"
            value={String(library.length)}
          />
          <StatCard
            icon={<SparkFilledIcon size={20} className="text-spark" />}
            label="Sparks sent"
            value={String(
              ledger.filter((l) => l.reason === 'chapter_spark').length
            )}
          />
          <StatCard
            icon={<HeartIcon size={20} className="text-primary-600" />}
            label="Membership"
            value={tier === 'spark_pro' ? 'Spark Pro' : tier === 'spark' ? 'Spark' : 'Free'}
          />
        </div>

        {/* Library preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-primary-900">
              Your bookshelf
            </h2>
          </div>

          {libraryLoading ? (
            <Spinner label="Loading shelf…" />
          ) : library.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-primary-500">
                Your shelf is empty. Stories you add will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {library.slice(0, 8).map((s) => (
                <a
                  key={s.id}
                  href={`/story/${s.slug}`}
                  className="block rounded-lg overflow-hidden border border-primary-100 hover:border-primary-300 transition-colors"
                >
                  <div className="aspect-[2/3] bg-primary-100">
                    {s.cover_url ? (
                      <img
                        src={s.cover_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                        <SparkFilledIcon size={24} className="text-spark opacity-70" />
                      </div>
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium text-primary-900 truncate">
                    {s.title}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Membership badge */}
        <section>
          <h2 className="font-display text-lg font-bold text-primary-900 mb-3">
            Badges
          </h2>
          <div className="flex gap-2">
            <MembershipBadge tier={tier} size="md" hideFree={false} />
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-primary-500 truncate">{label}</p>
        <p className="font-display text-xl font-bold text-primary-900 tabular-nums truncate">
          {value}
        </p>
      </div>
    </Card>
  );
}
