import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Watan — Your Professional Home",
  description:
    "The professional network for Palestinian diaspora worldwide. Find opportunities, share experiences, and build a career in a community that understands you.",
  keywords: [
    "Palestinian professionals",
    "career network",
    "job board",
    "company reviews",
    "diaspora",
    "professional community",
  ],
  openGraph: {
    title: "Watan — Your Professional Home",
    description:
      "The professional network for Palestinian diaspora worldwide.",
    type: "website",
    siteName: "Watan",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watan — Your Professional Home",
    description:
      "The professional network for Palestinian diaspora worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
