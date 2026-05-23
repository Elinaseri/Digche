import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { DirectionProvider, directionInitScript } from "@/lib/direction";
import { ToastProvider } from "@/components/Toast";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: directionInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <DirectionProvider>
            <ToastProvider>{children}</ToastProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
