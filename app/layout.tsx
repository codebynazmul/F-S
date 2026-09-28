import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Shift | Adapting Farms with NASA Earth Observations",
  description: "A Climate-Adaptive Crop Rotation & Soil Health Decision-Support System powered by NASA POWER, SMAP, and ECOSTRESS data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
