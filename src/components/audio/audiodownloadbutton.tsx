import { useState } from "react";

import { getAudioDownloadUrl } from "../../api/audio";
import { Button, useToast } from "../ui";

interface AudioDownloadButtonProps {
  chapterId: string;
  /** Optional filename override */
  filename?: string;
}

export function AudioDownloadButton({
  chapterId,
  filename,
}: AudioDownloadButtonProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    const result = await getAudioDownloadUrl(chapterId);

    if (result.error || !result.data) {
      setLoading(false);
      toast.error(result.error ?? "Could not prepare download.");
      return;
    }

    // Trigger browser download with the signed URL
    try {
      const a = document.createElement("a");
      a.href = result.data.url;
      a.download = filename ?? result.data.filename ?? `chapter-${chapterId}.mp3`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Download started");
    }
    catch {
      toast.error("Download failed. Try again.");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={handleDownload}
      leftIcon={
        !loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v14m0 0l-5-5m5 5l5-5M5 21h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      }
    >
      Download MP3
    </Button>
  );
}
