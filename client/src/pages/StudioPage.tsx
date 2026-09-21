import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { useAuthorStories } from '../hooks/useStories';
import { useSparks } from '../hooks/useSparks';
import { deleteStory } from '../api/stories';
import { PageWrapper } from '../components/layout';
import { Button, Card, useToast } from '../components/ui';
import { StudioStats, StoryDraftList } from '../components/studio';
import { PlusIcon, ArrowRightIcon, SparkFilledIcon, ChartIcon } from '../assets/icons';

export function StudioPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, profile, isAuthor } = useAuth();
  const { balance } = useSparks();

  const { stories, refetch } = useAuthorStories(user?.id ?? null, true);

  const handleDelete = async (storyId: string) => {
    const result = await deleteStory(storyId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Story deleted');
    refetch();
  };

  // Guard: not an author → push them to onboarding
  if (!isAuthor) {
    return (
      <PageWrapper title="Author studio" size="md">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <SparkFilledIcon size={24} className="text-spark-dark" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-900">
            Become an author
          </h1>
          <p className="mt-2 text-sm text-primary-500 max-w-sm mx-auto">
            You need an author profile to publish stories. Set one up in about a
            minute.
          </p>
          <div className="mt-6">
            <Link to="/onboarding">
              <Button variant="primary" size="lg">Set up author profile</Button>
            </Link>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  // Derived stats
  const published = stories.filter((s) => s.status !== 'draft').length;
  const sparksReceived = stories.reduce((sum, s) => sum + s.spark_count, 0);
  const totalReads = stories.reduce((sum, s) => sum + s.read_count, 0);

  return (
    <PageWrapper
      title={`Welcome back, ${profile?.display_name?.split(' ')[0] ?? 'author'}`}
      subtitle="Everything you write lives here as a draft until you publish it."
      action={
        <Button
          variant="primary"
          leftIcon={<PlusIcon size={16} />}
          onClick={() => navigate('/studio/new')}
        >
          New story
        </Button>
      }
      size="xl"
    >
      <div className="space-y-8">
        {/* Stats */}
        <StudioStats
          stories={stories.length}
          published={published}
          sparksReceived={sparksReceived}
          totalReads={totalReads}
        />

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLink
            to="/studio/settings/donations"
            icon={<SparkFilledIcon size={20} className="text-spark" />}
            title="Donation links"
            description="Connect Ko-fi, Patreon, BMAC, or any URL."
          />
          <QuickLink
            to="/studio/analytics"
            icon={<ChartIcon size={20} className="text-primary-600" />}
            title="Analytics"
            description="See which chapters earned the most Sparks."
          />
          <QuickLink
            to="/membership"
            icon={<SparkFilledIcon size={20} className="text-spark" />}
            title="Your Sparks"
            description={`${balance.toLocaleString()} Sparks available.`}
          />
        </div>

        {/* Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-primary-900">
              Your stories
            </h2>
            <span className="text-xs text-primary-400">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          <StoryDraftList
            stories={stories}
            onDelete={handleDelete}
            onCreateClick={() => navigate('/studio/new')}
          />
        </section>
      </div>
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
function QuickLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link to={to}>
      <Card interactive className="p-5 h-full">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-sm font-bold text-primary-900">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-primary-500">{description}</p>
          </div>
          <ArrowRightIcon size={14} className="text-primary-400 shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  );
}
