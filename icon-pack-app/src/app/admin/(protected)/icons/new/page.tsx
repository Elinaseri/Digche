import IconUploadForm from "./IconUploadForm";

export default function NewIconPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
          New Icon
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Upload SVG variants and add metadata. Saved as draft until published.
        </p>
      </div>

      <IconUploadForm />
    </div>
  );
}
