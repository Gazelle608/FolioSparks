import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { getStoryById, updateStory, deleteStory } from '../api/stories';
import { listChapters } from '../api/chapters';
import { useStoryDesk } from '../hooks/useDesk';
import { useStoryPolls } from '../hooks/usePolls';
import { PageWrapper } from '../components/layout';
import { Button, Card, Input, Select, Textarea, Tabs, useToast, Spinner } from '../components/ui';
import { DeskCard } from '../components/desks';
import { PollSummary } from '../components/polls';
import { PlusIcon, TrashIcon, PencilIcon } from '../assets/icons';
import type { Story } from '../types/story';
import type { Chapter } from '../types/chapter';

type Tab = 'chapters' | 'meta' | 'desk';

const GENRES = [
  { value: '', label: 'Select a genre…' },
  { value: 'epic-fantasy', label: 'Epic Fantasy' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'literary', label: 'Literary' },
  { value: 'historical', label: 'Historical' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'paranormal', label: 'Paranormal' },
  { value: 'dystopian', label: 'Dystopian' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'poetry', label: 'Poetry' },
];

export function EditStoryPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('chapters');

  const { desk } =
    useStoryDesk(storyId ?? null).desk
      ? useDeskManagementFallback(storyId)
      : useDeskManagementFallback(storyId);

  const { polls } = useStoryPolls(storyId ?? null);

  useEffect(() => {
    if (!storyId) return;
    (async () => {
      const [storyRes, chaptersRes] = await Promise.all([
        getStoryById(storyId),
        listChapters(storyId, true),
      ]);
      if (storyRes.data) setStory(storyRes.data);
      if (chaptersRes.data) setChapters(chaptersRes.data);
      setLoading(false);
    })();
  }, [storyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!story || !user) return <Navigate to="/studio" replace />;
  if (story.author_id !== user.id) return <Navigate to="/studio" replace />;

  const handleDelete = async () => {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    const result = await deleteStory(story.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Story deleted');
    navigate('/studio');
  };

  return (
    <PageWrapper
      title={story.title}
      subtitle={`${chapters.length} chapters · ${story.status}`}
      action={
        <div className="flex items-center gap-2">
          <Link to={`/story/${story.slug}`} target="_blank">
            <Button variant="ghost">View</Button>
          </Link>
          <Button
            variant="ghost"
            leftIcon={<TrashIcon size={14} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      }
      size="xl"
    >
      <Tabs
        items={[
          { id: 'chapters', label: 'Chapters', badge: chapters.length },
          { id: 'meta', label: 'Metadata' },
          { id: 'desk', label: 'Co-writing desk' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        className="mb-6"
      />

      {tab === 'chapters' && (
        <ChaptersTab
          story={story}
          chapters={chapters}
          polls={polls}
        />
      )}

      {tab === 'meta' && (
        <MetaTab story={story} onSaved={(next) => setStory(next)} />
      )}

      {tab === 'desk' && (
        <Card className="p-0">
          {desk ? (
            <DeskCard
              desk={desk}
              variant="owner"
              storyTitle={story.title}
              onChanged={() => {}}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-primary-500 mb-4">
                No co-writing desk is open for this story.
              </p>
              <Button variant="primary" onClick={() => {}}>
                Open a desk
              </Button>
            </div>
          )}
        </Card>
      )}
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
// Chapters tab
// ---------------------------------------------------------------------------
function ChaptersTab({
  story,
  chapters,
  polls,
}: {
  story: Story;
  chapters: Chapter[];
  polls: any[];
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-primary-500">
          {chapters.length === 0
            ? 'No chapters yet.'
            : `${chapters.length} total`}
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon size={14} />}
          onClick={() => navigate(`/studio/story/${story.id}/chapter/${chapters.length + 1}`)}
        >
          New chapter
        </Button>
      </div>

      {chapters.length > 0 && (
        <Card className="overflow-hidden divide-y divide-primary-100">
          {chapters.map((ch) => {
            const poll = polls.find((p) => p.chapter_id === ch.id);
            return (
              <div key={ch.id} className="p-4 flex items-center gap-4">
                <span className="text-xs text-primary-400 tabular-nums w-6">
                  {ch.chapter_number}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary-900 truncate">
                      {ch.title ?? `Chapter ${ch.chapter_number}`}
                    </span>
                    {ch.is_published ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                        Published
                      </span>
                    ) : ch.scheduled_for ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        Scheduled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">
                        Draft
                      </span>
                    )}
                  </div>
                  {poll && (
                    <div className="mt-2">
                      <PollSummary poll={poll} />
                    </div>
                  )}
                </div>
                <Link to={`/studio/story/${story.id}/chapter/${ch.chapter_number}`}>
                  <Button variant="ghost" size="sm" leftIcon={<PencilIcon size={12} />}>
                    Edit
                  </Button>
                </Link>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta tab
// ---------------------------------------------------------------------------
function MetaTab({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (next: Story) => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(story.title);
  const [genre, setGenre] = useState(story.genre);
  const [synopsis, setSynopsis] = useState(story.synopsis ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateStory(story.id, {
      title,
      genre,
      synopsis,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Saved');
    onSaved(result.data!);
  };

  return (
    <Card className="p-6 space-y-5 max-w-2xl">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Select
        label="Genre"
        options={GENRES}
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />
      <Textarea
        label="Synopsis"
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
        maxLength={1000}
        showCount
      />
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Placeholder — swap for the real useDeskManagement once the desk exists
// ---------------------------------------------------------------------------
function useDeskManagementFallback(_storyId?: string) {
  return {
    desk: null as any,
    members: [] as any[],
    pendingInvites: [] as any[],
    submissions: [] as any[],
    invite: async () => ({ error: null }),
    revokeInvite: async () => ({ error: null }),
    approve: async () => ({ error: null }),
    remove: async () => ({ error: null }),
    close: async () => ({ error: null }),
  };
}
