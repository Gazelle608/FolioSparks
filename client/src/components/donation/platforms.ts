import { type ComponentType, createElement, type ReactElement } from "react";

import { BmacIcon, KofiIcon, PatreonIcon } from "../../assets/icons";

// ---------------------------------------------------------------------------
// Brand colors for each platform — used for icon tints and hover states.
// Kept subtle; the button chrome stays neutral so it feels native to FolioSparks.
// ---------------------------------------------------------------------------
export interface PlatformMeta {
  id: string;
  name: string;
  /** Full action label, e.g. "Support on Patreon" */
  actionLabel: string;
  /** Short label for tight spaces */
  shortLabel: string;
  /** Brand color used for icon tint on hover */
  brandColor: string;
  /** URL prefix for validating author input */
  urlPrefix?: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}

export const PLATFORMS: Record<string, PlatformMeta> = {
  patreon: {
    id: "patreon",
    name: "Patreon",
    actionLabel: "Support on Patreon",
    shortLabel: "Patreon",
    brandColor: "#FF424D",
    urlPrefix: "https://www.patreon.com/",
    Icon: PatreonIcon,
  },
  ko_fi: {
    id: "ko_fi",
    name: "Ko-fi",
    actionLabel: "Buy a Ko-fi",
    shortLabel: "Ko-fi",
    brandColor: "#FF5E5B",
    urlPrefix: "https://ko-fi.com/",
    Icon: KofiIcon,
  },
  buymeacoffee: {
    id: "buymeacoffee",
    name: "Buy Me a Coffee",
    actionLabel: "Buy a Coffee",
    shortLabel: "Coffee",
    brandColor: "#FFDD00",
    urlPrefix: "https://www.buymeacoffee.com/",
    Icon: BmacIcon,
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    actionLabel: "Send via PayPal",
    shortLabel: "PayPal",
    brandColor: "#003087",
    Icon: PaypalGlyph,
  },
  stripe: {
    id: "stripe",
    name: "Stripe",
    actionLabel: "Support via Stripe",
    shortLabel: "Stripe",
    brandColor: "#635BFF",
    Icon: StripeGlyph,
  },
  cashapp: {
    id: "cashapp",
    name: "Cash App",
    actionLabel: "Send via Cash App",
    shortLabel: "Cash App",
    brandColor: "#00D632",
    Icon: CashAppGlyph,
  },
  venmo: {
    id: "venmo",
    name: "Venmo",
    actionLabel: "Send via Venmo",
    shortLabel: "Venmo",
    brandColor: "#3D95CE",
    Icon: VenmoGlyph,
  },
  custom: {
    id: "custom",
    name: "Support",
    actionLabel: "Support this author",
    shortLabel: "Support",
    brandColor: "#235347",
    Icon: CustomGlyph,
  },
};

// ---------------------------------------------------------------------------
// Lookup helper — always returns a valid meta, never undefined
// ---------------------------------------------------------------------------
export function getPlatformMeta(platform: string): PlatformMeta {
  return PLATFORMS[platform] ?? PLATFORMS.custom;
}

// ---------------------------------------------------------------------------
// Fallback glyphs (used only if assets folder doesn"t have one)
// ---------------------------------------------------------------------------
function PaypalGlyph({ size = 24, className = "" }: { size?: number; className?: string }): ReactElement {
  return createElement("svg", { "width": size, "height": size, "viewBox": "0 0 24 24", "fill": "currentColor", className, "aria-hidden": true }, createElement("path", { d: "M7.5 3h6.6c3.2 0 5.2 1.6 4.7 4.7-.5 3.3-2.9 4.8-6 4.8H10l-.9 6H5.5L7.5 3zm3.7 7.5h1.6c1.5 0 2.7-.6 2.9-2.1.2-1.4-.7-1.8-2-1.8h-1.7l-.8 3.9z" }), createElement("path", { d: "M12 11.4h1.3c2.5 0 3.4 1.3 3 3.4-.3 2.2-2 3-4.3 3H9.5l-.9 5.7H6l2.4-15.7h2.4L12 11.4z", opacity: "0.6" }));
}

function StripeGlyph({ size = 24, className = "" }: { size?: number; className?: string }) {
  return createElement("svg", { "width": size, "height": size, "viewBox": "0 0 24 24", "fill": "none", className, "aria-hidden": true }, createElement("rect", { x: "2", y: "4", width: "20", height: "16", rx: "3", fill: "currentColor" }), createElement("path", { d: "M11.4 9.2c-.7-.3-1.1-.5-1.1-.8 0-.3.2-.4.6-.4.5 0 1.1.2 1.6.4l.3-1.5c-.4-.2-1-.3-1.7-.3-1.6 0-2.7.8-2.7 2.2 0 .9.6 1.5 1.6 2 .6.3.8.4.8.8 0 .3-.2.5-.7.5-.6 0-1.4-.3-2-.6l-.3 1.5c.6.3 1.4.5 2.2.5 1.7 0 2.8-.8 2.8-2.2 0-.9-.5-1.5-1.4-2.1z", fill: "#DAF1DE" }));
}

function CashAppGlyph({ size = 24, className = "" }: { size?: number; className?: string }) {
  return createElement("svg", { "width": size, "height": size, "viewBox": "0 0 24 24", "fill": "currentColor", className, "aria-hidden": true }, createElement("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1.6 15.8v-1c-1.4 0-2.7-.4-3.6-1l.7-1.8c.9.5 2 .9 3 .8 1 0 1.6-.4 1.6-.9 0-.6-.6-.9-2-1.3-2.1-.6-3.5-1.5-3.5-3.3 0-1.6 1.1-2.8 2.9-3.2v-1h1.7v1c1.2 0 2.2.3 3 .8l-.7 1.8c-.8-.4-1.7-.6-2.6-.6-.9 0-1.5.3-1.5.8s.6.8 2.1 1.2c2.1.6 3.4 1.5 3.4 3.4 0 1.7-1.2 3-3.2 3。4v1h-１。３z" }));
}

function VenmoGlyph({ size = 24, className = "" }: { size?: number; className?: string }): ReactElement {
  return createElement(
    "svg",
    { "width": size, "height": size, "viewBox": "0 0 24 24", "fill": "currentColor", className, "aria-hidden": true },
    createElement("path", { d: "M19.5 3c.3 1 .5 2.1.5 3.5 0 4.3-3.7 10-6.7 14H6.7L3.5 3.4l5.5-.5 1.7 13.6c1.6-2.6 3.6-6.7 3.6-9.5 0-1.5-.3-2.6-.7-3.4L19.5 3z" }),
  );
}

function CustomGlyph({ size = 24, className = "" }: { size?: number; className?: string }): ReactElement {
  return createElement(
    "svg",
    { "width": size, "height": size, "viewBox": "0 0 24 24", "fill": "none", className, "aria-hidden": true },
    createElement("path", {
      d: "M12 21s-7-4.5-7-10a4.5 4.5 0 018-2.8 4.5 4.5 0 018 2.8c0 5.5-7 10-7 10l-1-1z",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinejoin: "round",
    }),
  );
}
