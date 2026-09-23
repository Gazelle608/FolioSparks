import { useState } from "react";

import type { MembershipTier } from "../../types/membership";

import { createCheckoutSession } from "../../api/memberships";
import { SparkFilledIcon } from "../../assets/icons";
import { Button, Modal } from "../ui";

interface Tier {
  id: MembershipTier;
  name: string;
  price: number;
  period: string;
  sparks: number;
  features: string[];
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  currentTier?: MembershipTier | null;
}

export function UpgradeModal({
  isOpen,
  onClose,
  tier,
  currentTier,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tier || tier.id === "free")
    return null;

  const isUpgrade
  = currentTier === "free"
    || currentTier === null
    || (currentTier === "spark" && tier.id === "spark_pro");

  const isDowngrade
  = currentTier === "spark_pro" && tier.id === "spark";

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const result = await createCheckoutSession(tier.id as "spark" | "spark_pro");

    if (result.error || !result.data) {
      setLoading(false);
      setError(result.error ?? "Could not start checkout. Try again.");
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = result.data.url;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpgrade ? `Upgrade to ${tier.name}` : `Switch to ${tier.name}`}
      description={
        isDowngrade
          ? "Your plan will change at the end of the current billing period."
          : `You"ll be charged $${tier.price} ${tier.period}.`
      }
      size="md"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckout}
            loading={loading}
          >
            {isDowngrade ? "Confirm switch" : `Continue to checkout`}
          </Button>
        </>
      )}
    >
      <div className="space-y-5">
        {/* Tier summary */}
        <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-bold text-primary-900">
              {tier.name}
            </span>
            <span className="font-display text-xl font-bold text-primary-900">
              $
              {tier.price}
              <span className="text-xs font-normal text-primary-500 ml-1">
                {tier.period}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-spark/15">
            <SparkFilledIcon size={14} className="text-spark-dark" />
            <span className="text-sm font-medium text-primary-900">
              {tier.sparks.toLocaleString()}
              Sparks every month
            </span>
          </div>
        </div>

        {/* Features list */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-2">
            What you get
          </h4>
          <ul className="space-y-2">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-primary-700">
                <span className="text-primary-500 mt-0.5 shrink-0" aria-hidden="true">
                  ✓
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust signals */}
        <div className="pt-4 border-t border-primary-100 space-y-2 text-xs text-primary-500">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🔒</span>
            <span>Secure payment powered by Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true">↩️</span>
            <span>Cancel anytime — no questions asked</span>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true">💚</span>
            <span>Most of your Sparks end up in an author"s pocket</span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
