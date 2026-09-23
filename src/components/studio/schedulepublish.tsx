import { useState } from "react";

import { Button, Modal } from "../ui";

interface SchedulePublishProps {
  isOpen: boolean;
  onClose: () => void;
  /** Existing scheduled date (when editing) */
  initialDate?: string | null;
  onConfirm: (isoDate: string) => Promise<{ error: string | null }>;
}

export function SchedulePublish({
  isOpen,
  onClose,
  initialDate,
  onConfirm,
}: SchedulePublishProps) {
  const [date, setDate] = useState(
    initialDate ? initialDate.slice(0, 16) : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!date)
      return;
    setLoading(true);
    setError(null);

    const result = await onConfirm(new Date(date).toISOString());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule publication"
      description="The chapter will go live automatically."
      size="sm"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={loading}
            disabled={!date}
          >
            Schedule
          </Button>
        </>
      )}
    >
      <input
        type="datetime-local"
        value={date}
        onChange={e => setDate(e.target.value)}
        min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}
        className="w-full h-10 px-3 rounded-md border border-primary-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
