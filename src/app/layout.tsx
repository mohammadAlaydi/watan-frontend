import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

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

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function Providers({ children }: { children: React.ReactNode }) {
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
        {children}
      </ClerkProvider>
    );
  }
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                fontFamily: "Plus Jakarta Sans, sans-serif",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
