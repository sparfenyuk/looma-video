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
  title: {
    default: "Looma Video",
    template: "%s · Looma Video",
  },
  description:
    "Looma automatically ingests social video links, clusters them into modules, and ships distraction-free course experiences in minutes.",
  metadataBase: new URL("https://looma.example.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased`}
      >
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(103,232,249,0.15),_transparent_50%)]" />
          <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8 lg:px-12">
            {children}
          </div>
          <footer className="px-6 pb-10 text-xs text-slate-500 sm:px-8 lg:px-12">
            <p>
              Looma Video — generated curriculum from your existing short-form content.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
