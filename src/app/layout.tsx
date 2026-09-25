import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Courier_Prime, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const hand = Mrs_Saint_Delafield({
  variable: "--font-hand-script",
  subsets: ["latin"],
  weight: "400",
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
  themeColor: "#100f0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${courier.variable} ${hand.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
