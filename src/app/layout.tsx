import type { Metadata, Viewport } from "next";
import { Baloo_Bhaijaan_2, Readex_Pro } from "next/font/google";
import "./globals.css";

const display = Baloo_Bhaijaan_2({
  subsets: ["latin", "arabic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Readex_Pro({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL ?? "https://playatthetable.netlify.app"),
  title: "Play at the Table",
  description:
    "Play at the Table: one QR coaster for menus, offers and games for kids, friends and couples. Built for Dubai restaurants and cafés.",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
