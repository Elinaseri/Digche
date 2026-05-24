import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
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
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-ink-900 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium focus:ring-2 focus:ring-ink-900"
        >
          Skip to icons
        </a>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
