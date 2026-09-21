import { useEffect, useState } from "react";

import {
  createDonationLink,
  deleteDonationLink,
  listDonationLinks,
} from "../../api/donations";
import { useAuth } from "../../hooks/useAuth";
import {
  type DonationLinkDraft,
  type DonationPlatform,
  DonationPlatformPicker,
} from "../auth/onboarding/DonationPlatformPicker";
import { Button, Card, useToast } from "../ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DonationLinkEditorProps {
  /** Optional — defaults to the signed-in author */
  authorId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DonationLinkEditor({ authorId }: DonationLinkEditorProps) {
  const { user } = useAuth();
  const toast = useToast();
  const targetAuthorId = authorId ?? user?.id;

  const [links, setLinks] = useState<DonationLinkDraft[]>([]);
  const [originalLinks, setOriginalLinks] = useState<DonationLinkDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Load existing links
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!targetAuthorId)
      return;

    const load = async () => {
      setLoading(true);
      const result = await listDonationLinks(targetAuthorId);

      if (result.data) {
        const drafts: DonationLinkDraft[] = result.data.map(l => ({
          platform: l.platform,
          url: l.url,
          label: l.label ?? undefined,
        }));
        setLinks(drafts);
        setOriginalLinks(drafts);
      }
      setLoading(false);
    };

    load();
  }, [targetAuthorId]);

  // ---------------------------------------------------------------------------
  // Diff and save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!targetAuthorId)
      return;
    setSaving(true);

    // Determine added links (in `links` but not in `originalLinks` by platform)
    const originalPlatforms = new Set(originalLinks.map(l => l.platform));
    const added = links.filter(l => !originalPlatforms.has(l.platform));

    // Determine removed links (in `originalLinks` but not in `links`)
    const currentPlatforms = new Set(links.map(l => l.platform));
    const removed = originalLinks.filter(l => !currentPlatforms.has(l.platform));

    // 1. Add new links
    for (const link of added) {
      const result = await createDonationLink({
        author_id: targetAuthorId,
        platform: link.platform,
        url: link.url,
        label: link.label,
        is_primary: links[0]?.platform === link.platform,
      });

      if (result.error) {
        setSaving(false);
        toast.error(`Failed to add ${link.platform}: ${result.error}`);
        return;
      }
    }

    // 2. Delete removed links — need their IDs, so refetch by platform
    if (removed.length > 0) {
      const listResult = await listDonationLinks(targetAuthorId);
      if (listResult.data) {
        for (const link of removed) {
          const match = listResult.data.find(l => l.platform === link.platform);
          if (match) {
            await deleteDonationLink(match.id);
          }
        }
      }
    }

    setSaving(false);
    setOriginalLinks(links);
    toast.success("Donation links updated");
  };

  // ---------------------------------------------------------------------------
  // Discard changes
  // ---------------------------------------------------------------------------
  const handleReset = () => {
    setLinks(originalLinks);
  };

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const hasChanges
  = links.length !== originalLinks.length
    || links.some((l, i) => {
      const orig = originalLinks[i];
      return !orig || orig.platform !== l.platform || orig.url !== l.url;
    });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-primary-100 rounded w-1/3" />
          <div className="h-24 bg-primary-100 rounded" />
        </div>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Donation links
        </h1>
        <p className="mt-1.5 text-sm text-primary-500 max-w-2xl">
          Readers see these links on every chapter you publish. FolioSparks
          takes 0% — clicks go straight to your platform.
        </p>
      </header>

      {/* Editor */}
      <Card className="p-5">
        <DonationPlatformPicker value={links} onChange={setLinks} max={5} />
      </Card>

      {/* Sticky action bar */}
      {hasChanges && (
        <div className="sticky bottom-4 z-20">
          <div className="mx-auto max-w-lg rounded-full bg-primary-900 text-primary-50 shadow-lg px-4 py-2.5 flex items-center justify-between gap-3">
            <span className="text-xs font-medium">
              You have unsaved changes
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="text-xs font-semibold text-primary-300 hover:text-primary-50"
              >
                Discard
              </button>
              <Button
                variant="spark"
                size="sm"
                onClick={handleSave}
                loading={saving}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview strip — how it looks to readers */}
      {links.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-3">
            Reader preview
          </div>
          <div className="rounded-md bg-primary-50 p-4 flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-primary-600 font-semibold">
              Support this author
            </span>
            {links.map(link => (
              <span
                key={link.platform}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-spark text-primary-900 text-sm font-semibold"
              >
                {platformLabel(link.platform)}
              </span>
            ))}
            <span className="text-xs text-primary-500 ml-auto">
              100% goes to the author
            </span>
          </div>
          <p className="mt-3 text-xs text-primary-400">
            This is how the strip appears on your story pages and chapter
            endings.
          </p>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function platformLabel(p: DonationPlatform): string {
  const map: Record<DonationPlatform, string> = {
    patreon: "Patreon",
    ko_fi: "Ko-fi",
    buymeacoffee: "Buy Me a Coffee",
    paypal: "PayPal",
    stripe: "Stripe",
    cashapp: "Cash App",
    venmo: "Venmo",
    custom: "Custom",
  };
  return map[p];
}
