import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketing Growth Quiz",
  description: "Discover your marketing superpower and get a personalised action plan.",
  openGraph: {
    title: "Marketing Growth Quiz",
    description: "Discover your marketing superpower and get a personalised action plan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body style={{ backgroundColor: '#6366f1' }} className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
