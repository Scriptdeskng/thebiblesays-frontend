import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const cabinetGrotesk = localFont({
  variable: "--font-cabinet-grotesk",
  src: [
    { path: "../public/fonts/CabinetGrotesk/CabinetGrotesk-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/CabinetGrotesk/CabinetGrotesk-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/CabinetGrotesk/CabinetGrotesk-Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "The Bible Says",
  description: "A platform for selling Bible-related merch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cabinetGrotesk.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
