import type { Metadata, Viewport } from "next";
import { Baloo_Da_2, DM_Mono, Figtree, Hind_Siliguri, Inter, Noto_Sans_Bengali } from "next/font/google";
import ServiceWorker from "@/components/ServiceWorker";
import "./globals.css";

// Farmer UI: Figtree (Latin) + Hind Siliguri (Bangla) for text, Baloo Da 2 for friendly rounded headings
// in both scripts. Inter + Noto Sans Bengali are kept for the admin panel, which keeps its original look.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-hind", display: "swap" });
const baloo = Baloo_Da_2({ subsets: ["bengali", "latin"], variable: "--font-baloo", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

export const metadata: Metadata = {
  title: "Agro Cosmic Weave | Agricultural Decision Support System",
  description:
    "A Climate-Adaptive Crop Rotation & Soil Health Decision-Support System for Bangladesh, developed by SPIDERX.",
  applicationName: "Agro Cosmic Weave",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Agro Cosmic Weave", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EA" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1610" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning className={`${figtree.variable} ${hind.variable} ${baloo.variable} ${dmMono.variable} ${inter.variable} ${bengali.variable}`}>
      <head>
        {/* Apply the saved theme and language before first paint so the page doesn't flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=function(k){var v=localStorage.getItem(k);try{return JSON.parse(v)}catch(e){return v}};var t=r('fs-theme');if(t==='night'||t==='day'){document.documentElement.setAttribute('data-theme',t);}var l=r('fs-lang');if(l==='bn'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-harvest-300 selection:text-slate-900">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
