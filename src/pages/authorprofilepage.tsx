import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { Author } from "../api/authors";
import type { DonationLink } from "../types/donation";
import type { StoryCardData } from "../types/story";
import type { Profile } from "../types/user";

import { listDonationLinks } from "../api/donations";
import { supabase } from "../api/supabase";
import { DonationLinkList } from "../components/donation";
import { PageWrapper } from "../components/layout";
import { StoryGrid } from "../components/stories";
import { Avatar, Spinner } from "../components/ui";
import { useAuthorStories } from "../hooks/usestories";

export function AuthorProfilePage() {
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [donations, setDonations] = useState<DonationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const cleanUsername = username?.replace(/^@/, "") ?? "";
  const { stories } = useAuthorStories(profile?.id ?? null, false);

  useEffect(() => {
    if (!cleanUsername) {
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (cancelled)
        return;

      if (error || !prof) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const profileData = prof as unknown as Profile;
      setProfile(profileData);

      const { data: auth } = await supabase
        .from("authors")
        .select("*")
        .eq("id", profileData.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }
      if (auth) {
        setAuthor(auth);
      }

      const donationsRes = await listDonationLinks(profileData.id);
      if (cancelled) {
        return;
      }
      setDonations(donationsRes.data ?? []);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [cleanUsername]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <PageWrapper title="Profile not found" size="md">
        <p className="text-center text-primary-500">
          No user with the handle @
          {cleanUsername}
          .
        </p>
      </PageWrapper>
    );
  }

  return (
    <>
      {/* Profile header */}
      <div className="bg-gradient-to-b from-primary-900 to-primary-800 text-primary-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Avatar
            src={profile.avatar_url ?? undefined}
            name={profile.display_name}
            size="xl"
            className="mx-auto ring-4 ring-primary-700"
          />
          <h1 className="mt-5 font-display text-3xl font-bold">
            {author?.pen_name ?? profile.display_name}
          </h1>
          <p className="mt-1 text-sm text-primary-300">
            @
            {profile.username}
          </p>

          {author?.tagline && (
            <p className="mt-3 text-primary-200 max-w-lg mx-auto">
              {author.tagline}
            </p>
          )}

          {profile.bio && (
            <p className="mt-4 text-primary-100 max-w-xl mx-auto text-sm leading-relaxed">
              {profile.bio}
            </p>
          )}

          {author && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div>
                <div className="font-display text-2xl font-bold text-spark tabular-nums">
                  {author.total_sparks_received.toLocaleString()}
                </div>
                <div className="text-primary-300 text-xs uppercase tracking-wider">
                  Sparks received
                </div>
              </div>
              <div className="w-px h-10 bg-primary-700" />
              <div>
                <div className="font-display text-2xl font-bold text-primary-50 tabular-nums">
                  {author.total_reads.toLocaleString()}
                </div>
                <div className="text-primary-300 text-xs uppercase tracking-wider">
                  Reads
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PageWrapper size="lg">
        {/* Donations */}
        {donations.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-lg font-bold text-primary-900 mb-3">
              Support this author
            </h2>
            <DonationLinkList links={donations} layout="grid" size="md" />
          </section>
        )}

        {/* Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-primary-900">
              Stories
            </h2>
            <span className="text-xs text-primary-400">{stories.length}</span>
          </div>

          <StoryGrid
            stories={stories as unknown as StoryCardData[]}
            columns={3}
            emptyTitle="No stories published yet"
            emptyDescription="Check back soon."
          />
        </section>
      </PageWrapper>
    </>
  );
}
