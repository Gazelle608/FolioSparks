import { useState } from "react";

import {
  BmacIcon,
  KofiIcon,
  PatreonIcon,
} from "../../../assets/icons";
import { Button, Input } from "../../ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DonationPlatform =
  | "patreon"
  | "ko_fi"
  | "buymeacoffee"
  | "paypal"
  | "stripe"
  | "cashapp"
  | "venmo"
  | "custom";

export interface DonationLinkDraft {
  platform: DonationPlatform;
  label?: string;
  url: string;
}

interface DonationPlatformPickerProps {
  value: DonationLinkDraft[];
  onChange: (next: DonationLinkDraft[]) => void;
  /** Max number of links the author can add */
  max?: number;
}

// ---------------------------------------------------------------------------
// Platform metadata
// ---------------------------------------------------------------------------
interface PlatformMeta {
  id: DonationPlatform;
  name: string;
  description: string;
  urlPrefix?: string; // used to validate URL
  urlPlaceholder: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PLATFORMS: PlatformMeta[] = [
  {
    id: "patreon",
    name: "Patreon",
    description: "Monthly memberships",
    urlPrefix: "https://www.patreon.com/",
    urlPlaceholder: "https://www.patreon.com/yourname",
    Icon: PatreonIcon,
  },
  {
    id: "ko_fi",
    name: "Ko-fi",
    description: "Tips & commissions",
    urlPrefix: "https://ko-fi.com/",
    urlPlaceholder: "https://ko-fi.com/yourname",
    Icon: KofiIcon,
  },
  {
    id: "buymeacoffee",
    name: "Buy Me a Coffee",
    description: "One-time support",
    urlPrefix: "https://www.buymeacoffee.com/",
    urlPlaceholder: "https://www.buymeacoffee.com/yourname",
    Icon: BmacIcon,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Direct payments",
    urlPlaceholder: "https://paypal.me/yourname",
    Icon: PaypalGlyph,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment link",
    urlPlaceholder: "https://buy.stripe.com/...",
    Icon: StripeGlyph,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DonationPlatformPicker({
  value,
  onChange,
  max = 5,
}: DonationPlatformPickerProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformMeta | null>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSelected = (id: DonationPlatform) =>
    value.some(v => v.platform === id);

  const handleTileClick = (platform: PlatformMeta) => {
    if (isSelected(platform.id)) {
      // Deselect
      onChange(value.filter(v => v.platform !== platform.id));
      setActivePlatform(null);
      setDraftUrl("");
      return;
    }

    if (value.length >= max) {
      setError(`You can add up to ${max} platforms.`);
      return;
    }

    setError(null);
    setActivePlatform(platform);
    setDraftUrl(platform.urlPrefix ?? "");
  };

  const handleUrlSave = () => {
    if (!activePlatform)
      return;

    const url = draftUrl.trim();
    if (!url)
      return setError("Paste your profile URL");
    if (!/^https?:\/\//i.test(url))
      return setError("URL must start with http:// or https://");

    onChange([
      ...value,
      { platform: activePlatform.id, url },
    ]);

    setActivePlatform(null);
    setDraftUrl("");
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => {
          const selected = isSelected(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => handleTileClick(platform)}
              className={[
                "group flex flex-col items-start gap-2 p-3 rounded-lg border text-left",
                "transition-all duration-150",
                selected
                  ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                  : "border-primary-100 bg-white hover:border-primary-300 hover:bg-primary-50",
              ].join(" ")}
              aria-pressed={selected}
            >
              <platform.Icon size={24} className="text-primary-700" />
              <div>
                <div className="text-sm font-semibold text-primary-900">
                  {platform.name}
                </div>
                <div className="text-xs text-primary-500">
                  {platform.description}
                </div>
              </div>
              {selected && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary-700">
                  ✓ Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* URL editor for the active tile */}
      {activePlatform && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <activePlatform.Icon size={18} className="text-primary-700" />
            <span className="text-sm font-semibold text-primary-900">
              Add your
              {activePlatform.name}
              URL
            </span>
          </div>

          <Input
            type="url"
            placeholder={activePlatform.urlPlaceholder}
            value={draftUrl}
            onChange={e => setDraftUrl(e.target.value)}
            error={error ?? undefined}
            autoFocus
          />

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={handleUrlSave}>
              Add link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setActivePlatform(null);
                setDraftUrl("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List of added links */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary-500">
            Your donation links (
            {value.length}
            /
            {max}
            )
          </div>
          <ul className="space-y-2">
            {value.map(link => (
              <li
                key={link.platform}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-white border border-primary-100"
              >
                <span className="text-xs font-medium text-primary-700 w-28 shrink-0">
                  {labelFor(link.platform)}
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
                  onClick={() =>
                    onChange(value.filter(v => v.platform !== link.platform))}
                  className="text-xs text-primary-400 hover:text-danger"
                  aria-label={`Remove ${labelFor(link.platform)} link`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trust note */}
      <div className="flex items-start gap-2 text-xs text-primary-500 bg-primary-50 rounded-md p-3">
        <span className="text-primary-600 mt-0.5" aria-hidden="true">✦</span>
        <p>
          FolioSparks takes
          <strong>0%</strong>
          {" "}
          of donations. Readers click
          through to your page and pay you directly — you keep every cent.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function labelFor(platform: DonationPlatform): string {
  switch (platform) {
    case "patreon": return "Patreon";
    case "ko_fi": return "Ko-fi";
    case "buymeacoffee": return "Buy Me a Coffee";
    case "paypal": return "PayPal";
    case "stripe": return "Stripe";
    case "cashapp": return "Cash App";
    case "venmo": return "Venmo";
    case "custom": return "Custom";
  }
}

// ---------------------------------------------------------------------------
// Inline glyphs (Patreon / Ko-fi / Bmac come from assets; these are local)
// ---------------------------------------------------------------------------
function PaypalGlyph({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.5 3h6.6c3.2 0 5.2 1.6 4.7 4.7-.5 3.3-2.9 4.8-6 4.8H10l-.9 6H5.5L7.5 3zm3.7 7.5h1.6c1.5 0 2.7-.6 2.9-2.1.2-1.4-.7-1.8-2-1.8h-1.7l-.8 3.9zM12 11.4h1.3c2.5 0 3.4 1.3 3 3.4-.3 2.2-2 3-4.3 3H9.5l-.9 5.7H6l2.4-15.7h2.4L12 11.4z"
      />
    </svg>
  );
}

function StripeGlyph({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="currentColor" />
      <path
        d="M11.4 9.2c-.7-.3-1.1-.5-1.1-.8 0-.3.2-.4.6-.4.5 0 1.1.2 1.6.4l.3-1.5c-.4-.2-1-.3-1.7-.3-1.6 0-2.7.8-2.7 2.2 0 .9.6 1.5 1.6 2 .6.3.8.4.8.8 0 .3-.2.5-.7.5-.6 0-1.4-.3-2-.6l-.3 1.5c.6.3 1.4.5 2.2.5 1.7 0 2.8-.8 2.8-2.2 0-.9-.5-1.5-1.4-2.1zM16.6 8.4c-.7 0-1.2.3-1.6.9l-.1-.8h-1.6l-1.4 7.2h1.7l.6-3.1c.3-1.5 1-2.3 1.9-2.3.5 0 .7.3.7.8 0 .2 0 .4-.1.6l-.5 2.6c-.1.5-.1.9-.1 1.1h1.7c0-.2 0-.6.1-1.1l.5-2.6c.1-.5.2-1 .2-1.4 0-1.2-.7-1.9-1.6-1.9z"
        fill="#DAF1DE"
      />
    </svg>
  );
}
