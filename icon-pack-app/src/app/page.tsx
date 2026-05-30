import IconGallery from "@/components/IconGallery";
import { manifest as staticManifest, iconBodies as staticBodies } from "@/lib/icons";
import { getPublishedDbIcons, mergeWithStatic } from "@/lib/services/publicIcons";
import { createClient } from "@/lib/supabase/server";
import UserHeader from "@/components/UserHeader";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  let dbIcons: Awaited<ReturnType<typeof getPublishedDbIcons>> = [];
  try {
    dbIcons = await getPublishedDbIcons();
  } catch {
    // Supabase not configured or unavailable — fall back to static icons only
  }

  const { manifest, bodies } = mergeWithStatic(staticManifest, staticBodies, dbIcons);

  return (
    <>
      <UserHeader displayName={displayName} />
      <IconGallery manifest={manifest} bodies={bodies} />
    </>
  );
}
