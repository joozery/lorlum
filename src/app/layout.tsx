import type { Metadata } from "next";
import { Noto_Sans_Thai, Prompt } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Panel | E-Commerce",
  description: "E-Commerce Admin Management Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${prompt.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full bg-gray-50 font-[family-name:var(--font-noto-thai)]">
        {children}
      </body>
    </html>
  );
}
