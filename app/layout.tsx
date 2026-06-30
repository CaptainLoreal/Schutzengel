import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Schutzengel — get hired by doing the work",
  description:
    "Crack real business-development cases, present your thinking on video, and get vetted on how you actually think.",
};

// Set the theme before paint to avoid a flash. Default is dark.
const themeScript = `(function(){try{var t=localStorage.getItem('schutzengel-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Nav />
        {children}
      </body>
    </html>
  );
}
