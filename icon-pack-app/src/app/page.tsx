import IconGallery from "@/components/IconGallery";
import { manifest, iconBodies } from "@/lib/icons";

export default function Home() {
  return <IconGallery manifest={manifest} bodies={iconBodies} />;
}
