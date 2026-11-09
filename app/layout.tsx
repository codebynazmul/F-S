import type { Metadata, Viewport } from "next";
import { DM_Mono, Instrument_Sans, Inter, Noto_Sans_Bengali } from "next/font/google";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

// Instrument Sans for the app; Inter is kept for the admin panel, which keeps its original look.
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });
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
    { media: "(prefers-color-scheme: light)", color: "#F7F9F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1517" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning className={`${instrument.variable} ${dmMono.variable} ${inter.variable} ${bengali.variable}`}>
      <head>
        {/* Apply the saved theme and language before first paint so the page doesn't flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=function(k){var v=localStorage.getItem(k);try{return JSON.parse(v)}catch(e){return v}};var t=r('fs-theme');if(t==='night'||t==='day'){document.documentElement.setAttribute('data-theme',t);}var l=r('fs-lang');if(l==='bn'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-sky-600 selection:text-white">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
