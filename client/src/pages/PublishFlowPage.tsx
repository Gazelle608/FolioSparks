import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { getStoryById } from '../api/stories';
import { PageWrapper } from '../components/layout';
import { Card, Spinner } from '../components/ui';
import {
  PublishChoice,
  FullManuscriptUpload,
  ChapterByChapterUpload,
} from '../components/studio';
import type { Story } from '../types/story';

type Mode = 'choose' | 'full' | 'chapters';

export function PublishFlowPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('choose');

  useEffect(() => {
    if (!storyId) return;
    getStoryById(storyId).then((res) => {
      if (res.data) setStory(res.data as unknown as Story);
      setLoading(false);
    });
  }, [storyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!story || !user) {
    return <Navigate to="/studio" replace />;
  }

  return (
    <PageWrapper size="lg">
      <Card className="p-6 sm:p-8">
        {mode === 'choose' && (
          <PublishChoice
            storyTitle={story.title}
            onChoose={(choice) =>
              setMode(choice === 'full_manuscript' ? 'full' : 'chapters')
            }
            onCancel={() => navigate(`/studio/story/${story.id}`)}
          />
        )}

        {mode === 'full' && (
          <FullManuscriptUpload
            storyId={story.id}
            authorId={user.id}
            onDone={() => navigate(`/studio/story/${story.id}`)}
            onCancel={() => setMode('choose')}
          />
        )}

        {mode === 'chapters' && (
          <ChapterByChapterUpload
            storyId={story.id}
            authorId={user.id}
            onDone={(num) =>
              navigate(`/studio/story/${story.id}/chapter/${num}`)
            }
            onCancel={() => setMode('choose')}
          />
        )}
      </Card>
    </PageWrapper>
  );
}
