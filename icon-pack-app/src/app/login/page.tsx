import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedDbIcons } from "@/lib/services/publicIcons";
import LoginPageClient from "./LoginPageClient";
import type { ShowcaseIcon } from "./LoginPageClient";

export const metadata = { title: "Sign in — Digche Icons" };

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  let showcaseIcons: ShowcaseIcon[] = [];
  try {
    const published = await getPublishedDbIcons();
    // Pass all published icons so keyword matching finds the best fit
    showcaseIcons = published.map((i) => ({
      slug: i.slug,
      name: i.name,
      bodies: Object.fromEntries(i.variants.map((v) => [v.style, v.svgBody])),
    }));
  } catch {
    // DB unavailable — showcase renders without icons
  }

  return <LoginPageClient showcaseIcons={showcaseIcons} />;
}
