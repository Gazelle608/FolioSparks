import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { Chapter } from "../types/chapter";
import type { DonationLink } from "../types/donation";
import type { Story, StoryCardData } from "../types/story";

import { listChapters } from "../api/chapters";
import { listDonationLinks } from "../api/donations";
import { getStoryBySlug } from "../api/stories";
import { ArrowRightIcon, LockIcon } from "../assets/icons";
import { DeskCard } from "../components/desks";
import { DonationBanner, DonationLinkList } from "../components/donation";
import { Container } from "../components/layout";
import { StoryHero, StoryTags } from "../components/stories";
import { Button, Card, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useauth";
import { useStoryDesk } from "../hooks/usedesk";

const PUBLIC_CHAPTER_LIMIT = 3;

export function StoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [donations, setDonations] = useState<DonationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { desk, members } = useStoryDesk(story?.id ?? null);

  useEffect(() => {
    if (!slug)
      return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const storyResult = await getStoryBySlug(slug);
      if (cancelled)
        return;

      if (storyResult.error || !storyResult.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = storyResult.data;
      setStory(s as unknown as Story);

      const [chaptersRes, donationsRes] = await Promise.all([
        listChapters(String(s.id), false),
        s.is_donation_enabled ? listDonationLinks(String(s.author_id)) : Promise.resolve({ data: [], error: null }),
      ]);

      if (cancelled)
        return;
      setChapters((chaptersRes.data ?? []) as unknown as Chapter[]);
      setDonations(donationsRes.data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" label="Loading story…" />
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <Container size="md" className="py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-primary-900">
          Story not found
        </h1>
        <p className="mt-2 text-primary-500">
          This story may have been removed or the link is wrong.
        </p>
        <Link to="/library" className="inline-block mt-6">
          <Button variant="primary">Back to library</Button>
        </Link>
      </Container>
    );
  }

  const startReading = () => {
    const first = chapters[0];
    if (first)
      navigate(`/read/${story.slug}/${first.chapter_number}`);
    else navigate(`/story/${story.slug}`);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <StoryHero
        story={story as unknown as StoryCardData}
        donationLinks={donations}
        onStartReading={startReading}
        onAddToLibrary={() => {}}
        isInLibrary={false}
      />

      <Container size="xl" className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left column: chapters + desk */}
          <div className="space-y-8 min-w-0">
            {/* Chapter list */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-primary-100 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-primary-900">
                  Chapters
                </h2>
                <span className="text-xs text-primary-500">
                  {chapters.length}
                  published
                </span>
              </div>

              {chapters.length === 0
                ? (
                    <p className="p-8 text-center text-sm text-primary-400 italic">
                      No chapters published yet.
                    </p>
                  )
                : (
                    <ul className="divide-y divide-primary-100">
                      {chapters.map((ch) => {
                        const isLocked = !user && ch.chapter_number > PUBLIC_CHAPTER_LIMIT;
                        return (
                          <li key={ch.id}>
                            <Link
                              to={
                                isLocked
                                  ? `/signup?next=/read/${story.slug}/${ch.chapter_number}`
                                  : `/read/${story.slug}/${ch.chapter_number}`
                              }
                              className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50 transition-colors"
                            >
                              <span className="text-xs text-primary-400 tabular-nums w-8 shrink-0">
                                {ch.chapter_number}
                              </span>
                              <span className="flex-1 min-w-0 truncate text-sm text-primary-900">
                                {ch.title ?? `Chapter ${ch.chapter_number}`}
                              </span>
                              {isLocked && (
                                <LockIcon size={14} className="text-primary-300 shrink-0" />
                              )}
                              <span className="text-xs text-primary-400 tabular-nums shrink-0">
                                {ch.word_count.toLocaleString()}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
            </Card>

            {/* Co-writing desk */}
            {desk && (
              <DeskCard
                desk={desk}
                variant="public"
                storyTitle={story.title}
              />
            )}

            {/* Synopsis (mobile — moved from hero) */}
            {story.synopsis && (
              <Card className="p-5 lg:hidden">
                <h2 className="font-display text-base font-bold text-primary-900 mb-2">
                  About this story
                </h2>
                <p className="text-sm text-primary-600 leading-relaxed">
                  {story.synopsis}
                </p>
                {story.tags.length > 0 && (
                  <div className="mt-4">
                    <StoryTags tags={story.tags} size="md" limit={8} />
                  </div>
                )}
              </Card>
            )}

            {/* Chapter-end donation nudge */}
            {story.is_donation_enabled && donations.length > 0 && (
              <DonationBanner
                variant="chapter-end"
                authorName={story.title}
                ctaHref="#support"
              />
            )}
          </div>

          {/* Right column: sidebar */}
          <aside className="space-y-6">
            <Card className="p-5">
              <h3 className="font-display text-sm font-bold text-primary-900 mb-3">
                Reading progress
              </h3>
              <p className="text-xs text-primary-500 mb-3">
                {chapters.length > 0
                  ? `${chapters.length} chapters · ${chapters.reduce((s, c) => s + c.word_count, 0).toLocaleString()} words`
                  : "No chapters yet"}
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={startReading}
                disabled={chapters.length === 0}
                rightIcon={<ArrowRightIcon size={14} />}
              >
                {chapters.length > 0 ? "Start reading" : "Coming soon"}
              </Button>
            </Card>

            {/* Author donation links */}
            {donations.length > 0 && (
              <Card className="p-5" id="support">
                <h3 className="font-display text-sm font-bold text-primary-900 mb-1">
                  Support this author
                </h3>
                <p className="text-xs text-primary-500 mb-4">
                  100% of donations go directly to the writer.
                </p>
                <DonationLinkList
                  links={donations}
                  layout="stack"
                  size="sm"
                />
              </Card>
            )}

            {/* Co-writers strip */}
            {members.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display text-sm font-bold text-primary-900 mb-3">
                  On this desk
                  (
                  {members.length}
                  )
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.slice(0, 6).map(m => (
                    <Link
                      key={m.id}
                      to={`/@${m.profile?.username ?? m.user_id}`}
                      className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"
                    >
                      {m.profile?.display_name ?? "Unknown"}
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
