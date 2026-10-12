import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

// Rubik covers Latin and Arabic, so English and العربية match.
const rubik = Rubik({
  subsets: ["latin", "arabic"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL ?? "https://playatthetable.netlify.app"),
  title: "Play at Your Table",
  description:
    "Play at Your Table: one QR coaster for menus, offers and games for kids, friends and couples. Built for Dubai restaurants and cafés.",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rubik.variable}>
      <body>{children}</body>
    </html>
  );
}
