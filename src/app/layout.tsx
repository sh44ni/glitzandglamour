import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA',
  description: 'Premium nail, hair, and beauty services by JoJany in Vista, CA. Book your appointment today.',
  manifest: '/manifest.json',
  keywords: 'nails, hair, beauty, salon, Vista CA, gel nails, balayage, facials, JoJany',
  openGraph: {
    title: 'Glitz & Glamour Studio',
    description: 'Nails, Hair & Beauty in Vista, CA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF2D78',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Glitz & Glamour" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <SessionProvider>
          {/* Floating orb background — global */}
          <div className="orb-container" aria-hidden="true">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>

          {/* Desktop top navigation */}
          <TopNav />

          {/* Main content */}
          <main style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </main>

          {/* Mobile bottom navigation */}
          <BottomNav />

          {/* Mobile nav spacer */}
          <div className="bottom-nav-spacer md:hidden" />
        </SessionProvider>
      </body>
    </html>
  );
}
