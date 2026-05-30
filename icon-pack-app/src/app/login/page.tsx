import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedDbIcons } from "@/lib/services/publicIcons";
import LoginPageClient from "./LoginPageClient";

export const metadata = { title: "Sign in — Digche Icons" };

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");

  let floatingIcons: { svgBody: string; slug: string }[] = [];
  try {
    const published = await getPublishedDbIcons();
    // Prefer Linear/Outline for clean look; shuffle for variety
    const candidates = published
      .filter((i) => i.variants.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
    floatingIcons = candidates.map((i) => {
      const variant =
        i.variants.find((v) => v.style === "Linear") ??
        i.variants.find((v) => v.style === "Outline") ??
        i.variants[0];
      return { slug: i.slug, svgBody: variant.svgBody };
    });
  } catch {
    // DB unavailable — left panel shows with no icons
  }

  return <LoginPageClient floatingIcons={floatingIcons} />;
}
