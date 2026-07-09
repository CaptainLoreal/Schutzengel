import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

// Warm, soft, round serif — softened via the SOFT optical axis.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Schutzengel — get hired by doing the work",
  description:
    "Crack real business-development cases, present your thinking on video, and get vetted on how you actually think.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Nav />
        {children}
      </body>
    </html>
  );
}
