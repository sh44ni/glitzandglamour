import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA",
    template: "%s | Glitz & Glamour Studio",
  },
  description:
    "Experience luxury nail care, hair color, haircuts, facials, and beauty services by JoJany Lavalle at Glitz & Glamour Studio in Vista, CA. Book your appointment today!",
  keywords: [
    "nail salon",
    "nails",
    "gel nails",
    "acrylic nails",
    "pedicure",
    "manicure",
    "facials",
    "waxing",
    "hair color",
    "balayage",
    "highlights",
    "haircuts",
    "beauty salon",
    "Vista",
    "CA",
    "California",
    "JoJany Lavalle",
    "Glitz and Glamour",
  ],
  authors: [{ name: "JoJany Lavalle" }],
  creator: "Glitz & Glamour Studio",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://glitzandglamours.com",
    siteName: "Glitz & Glamour Studio",
    title: "Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA",
    description:
      "Experience luxury nail care, hair color, haircuts, facials, and beauty services by JoJany Lavalle at Glitz & Glamour Studio in Vista, CA.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Glitz & Glamour Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA",
    description:
      "Experience luxury nail care, hair color, haircuts, facials, and beauty services by JoJany Lavalle.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navigation />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
