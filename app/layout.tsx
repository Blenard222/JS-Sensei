import type { Metadata } from "next";
import { Noto_Sans } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import "./globals.css";
import NavBar from "./components/NavBar";
import { ToastHost } from "./components/Toast";

const noto = Noto_Sans({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','600'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'JS Sensei',
  description: 'Level up your JavaScript fundamentals with an AI dojo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${noto.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="relative min-h-screen">
          {/* Subtle dojo background image */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] [background-image:url('/dojo.jpg')] bg-cover bg-center"
          />
          <div className="absolute inset-0 -z-10 bg-black/15" />

          <NavBar />
          <ToastHost>
            <div className="flex min-h-[calc(100vh-56px)] flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </ToastHost>
        </div>
      </body>
    </html>
  );
}
