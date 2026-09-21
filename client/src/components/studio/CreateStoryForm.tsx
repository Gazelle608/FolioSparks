import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createStory, uploadCover } from "../../api/stories";
import { useAuth } from "../../hooks/useauth";
import { Button, Input, Select, Textarea, useToast } from "../ui";

interface CreateStoryFormProps {
  /** Called when a story is successfully created */
  onCreated?: (storyId: string) => void;
}

const GENRES = [
  { value: "", label: "Select a genre…" },
  { value: "epic-fantasy", label: "Epic Fantasy" },
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Thriller" },
  { value: "horror", label: "Horror" },
  { value: "literary", label: "Literary" },
  { value: "historical", label: "Historical" },
  { value: "contemporary", label: "Contemporary" },
  { value: "adventure", label: "Adventure" },
  { value: "paranormal", label: "Paranormal" },
  { value: "dystopian", label: "Dystopian" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "poetry", label: "Poetry" },
];

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CreateStoryForm({ onCreated }: CreateStoryFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Cover upload
  // ---------------------------------------------------------------------------
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file)
      return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover must be under 5 MB");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user)
      return;

    const next: Record<string, string> = {};
    if (!title.trim())
      next.title = "Give your story a title";
    else if (title.trim().length < 2)
      next.title = "At least 2 characters";
    if (!genre)
      next.genre = "Pick a genre";
    if (synopsis.length > 1000)
      next.synopsis = "Max 1000 characters";

    setErrors(next);
    if (Object.keys(next).length > 0)
      return;

    setSubmitting(true);

    // 1. Create story
    const result = await createStory({
      author_id: user.id,
      title: title.trim(),
      slug: slugify(title),
      synopsis: synopsis.trim() || undefined,
      genre,
      publish_mode: "chapter_by_chapter",
    });

    if (result.error) {
      setSubmitting(false);
      // Slug collision is the most common error
      if (result.error.toLowerCase().includes("duplicate")) {
        setErrors({ title: "A story with a similar title already exists" });
      }
      else {
        setErrors({ form: result.error });
      }
      return;
    }

    const storyId = result.data!.id;

    // 2. Upload cover if provided
    if (coverFile) {
      const uploadResult = await uploadCover(storyId, coverFile);
      if (uploadResult.error) {
        toast.error("Story created, but cover upload failed. You can retry in the story editor.");
      }
    }

    setSubmitting(false);
    toast.success("Draft created");

    if (onCreated)
      onCreated(storyId);
    else navigate(`/studio/story/${storyId}`);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5">
        {/* Cover uploader */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-primary-900">
            Cover
          </label>
          <label className="block cursor-pointer">
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50 transition-colors">
              {coverPreview
                ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  )
                : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                      <UploadGlyph className="w-6 h-6 text-primary-400" />
                      <span className="text-xs text-primary-500 text-center">
                        Upload cover
                        <br />
                        <span className="text-primary-400">2:3 · max 5 MB</span>
                      </span>
                    </div>
                  )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCoverChange}
              className="sr-only"
            />
          </label>
          {coverPreview && (
            <button
              type="button"
              onClick={() => {
                setCoverFile(null);
                setCoverPreview(null);
              }}
              className="mt-2 text-xs text-primary-400 hover:text-danger"
            >
              Remove
            </button>
          )}
        </div>

        {/* Text fields */}
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="The Lantern Between Us"
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
            disabled={submitting}
            autoFocus
            maxLength={200}
          />

          <Select
            label="Genre"
            options={GENRES}
            value={genre}
            onChange={e => setGenre(e.target.value)}
            error={errors.genre}
            disabled={submitting}
          />

          <Textarea
            label="Synopsis"
            placeholder="A hook in two or three sentences."
            value={synopsis}
            onChange={e => setSynopsis(e.target.value)}
            error={errors.synopsis}
            disabled={submitting}
            maxLength={1000}
            showCount
          />
        </div>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
        >
          {errors.form}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-100">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/studio")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
        >
          Create draft
        </Button>
      </div>
    </form>
  );
}

function UploadGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15V3m0 0L7 8m5-5l5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
