import manifestJson from "@/data/manifest.json";
import bodiesJson from "@/data/icons.json";
import type { IconBodies, Manifest } from "./types";

export const manifest = manifestJson as Manifest;
export const iconBodies = bodiesJson as IconBodies;
