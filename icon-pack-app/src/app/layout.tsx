import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digche Icons — A beautiful icon pack for designers & developers",
  description:
    "548 hand-crafted icons in Bold, Bulk, Linear, and Outline styles. Free to use, easy to copy as SVG, JSX, or CSS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
