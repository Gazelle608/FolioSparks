import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { listDonationLinks, deleteDonationLink, createDonationLink } from '../api/donations';
import { PageWrapper } from '../components/layout';
import { Button, Card, Spinner, useToast } from '../components/ui';
import {
  DonationPlatformPicker,
  type DonationLinkDraft,
} from '../components/auth/onboarding/donationplatformpicker';
import { DonationBanner } from '../components/donation';
import { TrashIcon, PlusIcon } from '../assets/icons';
import type { DonationLink } from '../types/donation';

export function DonationSettingsPage() {
  const { user, isAuthor, loading: authLoading } = useAuth();
  const toast = useToast();

  const [links, setLinks] = useState<DonationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DonationLinkDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    listDonationLinks(user.id).then((res) => {
      if (res.data) {
        setLinks(res.data);
        setDraft(
          res.data.map((l) => ({
            platform: l.platform,
            url: l.url,
            label: l.label ?? undefined,
          }))
        );
      }
      setLoading(false);
    });
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !isAuthor) return <Navigate to="/studio" replace />;

  const handleSave = async () => {
    setSaving(true);

    // Delete all existing + recreate (simple strategy for MVP)
    await Promise.all(links.map((l) => deleteDonationLink(l.id)));

    for (const d of draft) {
      await createDonationLink({
        author_id: user.id,
        platform: d.platform,
        url: d.url,
        label: d.label,
      });
    }

    const refreshed = await listDonationLinks(user.id);
    if (refreshed.data) setLinks(refreshed.data);

    setSaving(false);
    setEditing(false);
    toast.success('Donation links updated');
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this donation link?')) return;
    const result = await deleteDonationLink(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success('Link removed');
  };

  return (
    <PageWrapper
      title="Donation links"
      subtitle="Connect your platforms. Readers pay you directly — FolioSparks takes 0%."
      size="md"
    >
      <div className="space-y-6">
        <DonationBanner variant="card" />

        <Card className="p-6">
          {!editing ? (
            <>
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-primary-500 mb-4">
                    No donation links yet.
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<PlusIcon size={14} />}
                    onClick={() => setEditing(true)}
                  >
                    Add your first link
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {links.map((link) => (
                      <li
                        key={link.id}
                        className="flex items-center gap-3 p-3 rounded-md border border-primary-100"
                      >
                        <span className="text-xs font-medium text-primary-700 w-24 shrink-0 capitalize">
                          {link.platform.replace('_', ' ')}
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 truncate text-sm text-primary-500 hover:text-primary-900"
                        >
                          {link.url}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemove(link.id)}
                          aria-label="Remove link"
                          className="p-1.5 rounded text-primary-400 hover:text-danger hover:bg-red-50"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    Edit links
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <DonationPlatformPicker value={draft} onChange={setDraft} />
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft(
                      links.map((l) => ({
                        platform: l.platform,
                        url: l.url,
                        label: l.label ?? undefined,
                      }))
                    );
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  Save links
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
