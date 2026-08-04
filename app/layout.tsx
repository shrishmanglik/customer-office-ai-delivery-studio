import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Office AI Delivery Studio",
  description: "A synthetic, governed workspace for AI workflow delivery evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
