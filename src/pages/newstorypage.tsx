import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { Card } from '../components/ui';
import { CreateStoryForm } from '../components/studio';

export function NewStoryPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Start a new story"
      subtitle="Everything here is a draft until you publish."
      size="md"
    >
      <Card className="p-6 sm:p-8">
        <CreateStoryForm
          onCreated={(storyId) => {
            navigate(`/studio/story/${storyId}/publish`);
          }}
        />
      </Card>
    </PageWrapper>
  );
}
