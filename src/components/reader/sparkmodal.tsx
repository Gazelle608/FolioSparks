import { useState } from "react";

import { SparkFilledIcon } from "../../assets/icons";
import { Button, Modal, Textarea, useToast } from "../ui";

// ---------------------------------------------------------------------------
// Quick-amount presets — adapt to the reader"s balance
// ---------------------------------------------------------------------------
const AMOUNT_PRESETS = [10, 25, 50, 100, 250];

interface SparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  authorName: string;
  /** Reader"s current balance */
  balance: number;
  /** Sparks already sent to this chapter by this reader (0 if none) */
  sparksSent?: number;
  /** Called with (amount, note) — should return a Promise */
  onSend: (amount: number, note: string) => Promise<{ error: string | null }>;
  /** Called after successful send */
  onSuccess?: () => void;
}

export function SparkModal({
  isOpen,
  onClose,
  chapterTitle,
  authorName,
  balance,
  sparksSent = 0,
  onSend,
  onSuccess,
}: SparkModalProps) {
  const toast = useToast();
  const [amount, setAmount] = useState(50);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insufficient = amount > balance;

  const handleSend = async () => {
    if (insufficient || amount <= 0)
      return;

    setSending(true);
    setError(null);

    const result = await onSend(amount, note.trim());

    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success(`Sent ${amount} Sparks to ${authorName}`);
    onSuccess?.();
    onClose();

    // Reset for next open
    setAmount(50);
    setNote("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Sparks"
      description={`To ${chapterTitle} by ${authorName}`}
      size="md"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="spark"
            onClick={handleSend}
            loading={sending}
            disabled={insufficient || amount <= 0}
            leftIcon={<SparkFilledIcon size={16} />}
          >
            Send
            {amount}
            Sparks
          </Button>
        </>
      )}
    >
      <div className="space-y-5">
        {/* Balance */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-primary-50">
          <span className="text-sm text-primary-600">Your balance</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-primary-900 tabular-nums">
            <SparkFilledIcon size={14} className="text-spark" />
            {balance.toLocaleString()}
          </span>
        </div>

        {/* Presets */}
        <div>
          <label className="block mb-2 text-sm font-medium text-primary-900">
            Amount
          </label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {AMOUNT_PRESETS.map((preset) => {
              const disabled = preset > balance;
              const active = amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  disabled={disabled}
                  className={[
                    "h-10 rounded-md text-sm font-semibold transition-colors",
                    active
                      ? "bg-spark text-primary-900 ring-2 ring-spark-dark"
                      : disabled
                        ? "bg-primary-50 text-primary-300 cursor-not-allowed"
                        : "bg-primary-50 text-primary-700 hover:bg-primary-100",
                  ].join(" ")}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom slider */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={Math.max(1, Math.min(balance, 500))}
              value={Math.min(amount, balance)}
              onChange={e => setAmount(Number(e.target.value))}
              className="flex-1 accent-spark"
              aria-label="Custom Sparks amount"
            />
            <input
              type="number"
              min={1}
              max={balance}
              value={amount}
              onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-20 h-9 px-2 rounded-md border border-primary-200 text-sm text-right tabular-nums focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Note */}
        <Textarea
          label="Add a note"
          placeholder="Tell the author what this chapter did to you…"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={500}
          showCount
          hint="Optional — authors see every note."
        />

        {/* Already sent indicator */}
        {sparksSent > 0 && (
          <div className="text-xs text-primary-500 flex items-center gap-1.5">
            <SparkFilledIcon size={12} className="text-spark" />
            You"ve already sent
            {sparksSent}
            Sparks to this chapter.
          </div>
        )}

        {/* Insufficient balance */}
        {insufficient && (
          <div className="px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
            Not enough Sparks. Your balance renews on the 1st — or
            {" "}
            <a href="/membership" className="underline font-medium">
              get more with a membership
            </a>
            .
          </div>
        )}

        {/* Error */}
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
