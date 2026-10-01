import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The House — The Intimate Table",
    template: "%s — The House",
  },
  description: "You don't open an app. You come back to a place.",
  applicationName: "The House",
  appleWebApp: { capable: true, title: "The House", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#15100d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrument.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
