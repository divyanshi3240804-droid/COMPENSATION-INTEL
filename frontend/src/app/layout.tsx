import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "LevelComp — Compensation Intelligence",
  description: "Level-based compensation insights for Indian tech",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-gray-100">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
