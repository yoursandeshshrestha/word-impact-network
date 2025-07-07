import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/common/contexts/LoadingContext";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/redux/provider";
import UserInitializer from "@/components/UserInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Word Imapct Network",
  description: "Word Imapct Network",
  icons: {
    icon: "/png-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReduxProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <UserInitializer />
          <Toaster position="top-right" expand={false} richColors />
          <LoadingProvider>{children}</LoadingProvider>
        </body>
      </ReduxProvider>
    </html>
  );
}
