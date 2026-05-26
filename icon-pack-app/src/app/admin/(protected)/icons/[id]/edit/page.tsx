import { notFound } from "next/navigation";
import { getIconById } from "@/lib/services/icons";
import EditIconForm from "./EditIconForm";

interface Props {
  params: { id: string };
}

export default async function EditIconPage({ params }: Props) {
  let icon = null;
  try {
    icon = await getIconById(params.id);
  } catch {
    // DB not connected — fall through to notFound
  }

  if (!icon) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
          Edit Icon
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 font-mono">
          {icon.slug}
        </p>
      </div>

      <EditIconForm icon={icon} />
    </div>
  );
}
