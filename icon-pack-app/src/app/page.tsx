import IconGallery from "@/components/IconGallery";
import { manifest as staticManifest, iconBodies as staticBodies } from "@/lib/icons";
import { getPublishedDbIcons, mergeWithStatic } from "@/lib/services/publicIcons";

export default async function Home() {
  let dbIcons: Awaited<ReturnType<typeof getPublishedDbIcons>> = [];
  try {
    dbIcons = await getPublishedDbIcons();
  } catch {
    // Supabase not configured or unavailable — fall back to static icons only
  }

  const { manifest, bodies } = mergeWithStatic(staticManifest, staticBodies, dbIcons);

  return <IconGallery manifest={manifest} bodies={bodies} />;
}
