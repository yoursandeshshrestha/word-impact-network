import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/common/contexts/LoadingContext";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/redux/provider";
import { UserProvider } from "./UserProvider";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReduxProvider>
        <UserProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Toaster position="top-right" expand={false} richColors />
            <LoadingProvider>{children}</LoadingProvider>
          </body>
        </UserProvider>
      </ReduxProvider>
    </html>
  );
}
