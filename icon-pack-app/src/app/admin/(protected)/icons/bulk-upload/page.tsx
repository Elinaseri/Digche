import BulkUploadForm from "./BulkUploadForm";

export default function BulkUploadPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Bulk Upload</h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Upload an entire category folder at once.
        </p>
      </div>
      <BulkUploadForm />
    </div>
  );
}
