import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Proofwork — get hired by doing the work",
  description:
    "Real challenges from real companies. Gain experience, build a portfolio, and get vetted by doing the actual work.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Nav />
        {children}
      </body>
    </html>
  );
}
