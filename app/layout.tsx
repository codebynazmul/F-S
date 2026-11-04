import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

export const metadata: Metadata = {
  title: "Field Shift | Agricultural Decision Support System",
  description:
    "A Climate-Adaptive Crop Rotation & Soil Health Decision-Support System for Bangladesh, developed by SPIDERX.",
  applicationName: "Field Shift",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Field Shift", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F9FF" },
    { media: "(prefers-color-scheme: dark)", color: "#161819" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning className={`${inter.variable} ${bengali.variable}`}>
      <head>
        {/* Apply the saved theme and language before first paint so the page doesn't flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=function(k){var v=localStorage.getItem(k);try{return JSON.parse(v)}catch(e){return v}};var t=r('fs-theme');if(t==='night'||t==='day'){document.documentElement.setAttribute('data-theme',t);}var l=r('fs-lang');if(l==='bn'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-sky-500 selection:text-white">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
