import type { Metadata, Viewport } from "next";
// @ts-expect-error: Next.js handles global CSS imports at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Shift | Agricultural Decision Support System",
  description:
    "A Climate-Adaptive Crop Rotation & Soil Health Decision-Support System for Bangladesh, developed by SPIDERX.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F9FF" },
    { media: "(prefers-color-scheme: dark)", color: "#161819" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint so the page doesn't flash the wrong colors. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fs-theme');try{t=JSON.parse(t)}catch(e){}if(t==='night'||t==='day'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
