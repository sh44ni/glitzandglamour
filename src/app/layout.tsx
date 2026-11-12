import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PageTracker from '@/components/PageTracker';
import ChatbotLazy from '@/components/ChatbotLazy';
import GoogleAnalyticsLazy from '@/components/GoogleAnalyticsLazy';
import OnboardingGuard from '@/components/OnboardingGuard';
import SiteFooter from '@/components/SiteFooter';
import { LanguageProvider } from '@/lib/i18n';
import NavigationFeedback from '@/components/NavigationFeedback';
import QuoteModalProvider from '@/components/QuoteModalProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

const GA_ID = 'G-4VMS8GSC0P';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.glitzandglamours.com'),
  title: 'Glitz & Glamour Studio | Nails, Hair & Beauty San Marcos',
  description: 'Nail, hair & beauty studio by Jojo at 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Gel-X, pedicures, balayage, facials & waxing. Book online!',
  keywords: 'nails, hair, beauty, salon, San Marcos CA, Vista CA, 935 W San Marcos Blvd, gel nails, balayage, facials, Jojo',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon-glitz.png',
  },
  openGraph: {
    siteName: 'Glitz & Glamour Studio',
    title: 'Glitz & Glamour Studio | Nails, Hair & Beauty San Marcos',
    description: 'Nails, Hair & Beauty at 935 W San Marcos Blvd, San Marcos, CA — Book your appointment today.',
    type: 'website',
    url: 'https://www.glitzandglamours.com',
    images: [{ url: '/herobg.jpeg', width: 1200, height: 630, alt: 'Glitz & Glamour Studio in San Marcos, CA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glitz & Glamour Studio | San Marcos, CA',
    description: 'Nails, Hair & Beauty at 935 W San Marcos Blvd, San Marcos, CA.',
    images: ['/herobg.jpeg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FF2D78',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Glitz & Glamour" />

        {/* Preconnect to Google Analytics — but don't block render */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Glitz & Glamour Studio",
              "image": "https://www.glitzandglamours.com/herobg.jpeg",
              "logo": "https://www.glitzandglamours.com/favicon-glitz.png",
              "@id": "https://www.glitzandglamours.com",
              "url": "https://www.glitzandglamours.com",
              "telephone": "+1-760-290-5910",
              "email": "info@glitzandglamours.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "935 W San Marcos Blvd, Suite 101",
                "addressLocality": "San Marcos",
                "addressRegion": "CA",
                "postalCode": "92078",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 33.1434,
                "longitude": -117.1856
              },
              "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "09:00", "closes": "19:00" }
              ],
              "priceRange": "$$",
              "sameAs": [
                "https://www.instagram.com/glitzandglamourstudio/"
              ]
            })
          }}
        />
      </head>
      {/* Google Analytics GA4 — Loaded on idle/interaction to unblock initial load and eliminate long tasks */}
      <GoogleAnalyticsLazy gaId={GA_ID} />
      <body>
        <LanguageProvider>
          <SessionProvider session={null} refetchOnWindowFocus={false}>
            <OnboardingGuard />
            <QuoteModalProvider>
              {/* Native page view tracker — fires on every route change */}
              <PageTracker />
              {/* Instantaneous click navigation feedback & top progress glow */}
              <NavigationFeedback />

              {/* Floating orb background — global */}
              <div className="orb-container" aria-hidden="true">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="film-grain" aria-hidden="true" />
              </div>

              {/* Desktop top navigation */}
              <TopNav />

              {/* Main content */}
              <main style={{ position: 'relative', zIndex: 1 }}>
                {children}
              </main>

              {/* Site-wide footer — SEO internal links */}
              <SiteFooter />

              {/* Mobile bottom navigation */}
              <BottomNav />

              {/* PWA install prompt */}
              <PWAInstallPrompt />

              {/* Hello Kitty AI Chatbot — lazy loaded */}
              <ChatbotLazy />
            </QuoteModalProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
