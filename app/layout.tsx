import type { Metadata } from "next";
import { DM_Sans, Josefin_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SessionProvider from "@/components/SessionProvider";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${josefinSans.variable}`}>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Tomorrowland Light & Power Co."
          href="/feed.xml"
        />
      </head>
      <body className="min-h-screen bg-[#0d1b2a] text-[#faf6f0] font-[family-name:var(--font-dm-sans)] antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
