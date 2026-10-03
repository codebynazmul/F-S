import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Shift | Agricultural Decision Support System",
  description:
    "A Climate-Adaptive Crop Rotation & Soil Health Decision-Support System developed by SPIDERX.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning>
      <head>
        {/* Set theme before paint to avoid flash of wrong colors. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fs-theme');if(t==='night'||t==='day'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
