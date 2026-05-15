import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codes Project Viewer",
  description: "Local-first dashboard for Codex project coordination reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
