import type { Metadata } from "next";
import { DM_Sans, Josefin_Sans } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
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
  title: "Tomorrowland Light & Power Co.",
  description: "A personal blog set in the world of New Tomorrowland 1994",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${josefinSans.variable}`}>
      <body className="min-h-screen bg-[#0d1b2a] text-[#faf6f0] font-[family-name:var(--font-dm-sans)] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
