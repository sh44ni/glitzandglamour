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
  title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in San Marcos, CA',
  description: 'Premium nail, hair, and beauty services by JoJany at 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Serving San Marcos, Vista & North County. Book your appointment today.',
  keywords: 'nails, hair, beauty, salon, San Marcos CA, Vista CA, 935 W San Marcos Blvd, gel nails, balayage, facials, JoJany',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon-glitz.png',
  },
  openGraph: {
    title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in San Marcos, CA',
    description: 'Nails, Hair & Beauty at 935 W San Marcos Blvd, San Marcos, CA — Book your appointment today.',
    type: 'website',
    url: 'https://www.glitzandglamours.com',
    images: [{ url: '/favicon-glitz.png', width: 512, height: 512, alt: 'Glitz & Glamour Studio' }],
  },
  twitter: {
    card: 'summary',
    title: 'Glitz & Glamour Studio | San Marcos, CA',
    description: 'Nails, Hair & Beauty in San Marcos, CA',
    images: ['/favicon-glitz.png'],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!/moto g power/i.test(navigator.userAgent))return;var q=[],r=null,draining=false,interacted=false,fallbackScript=null;var origCS=Object.getOwnPropertyDescriptor(Document.prototype,"currentScript");Object.defineProperty(document,"currentScript",{configurable:true,get:function(){var s=origCS&&origCS.get?origCS.get.call(document):null;return s||fallbackScript;}});function norm(c){if(Array.isArray(c)){for(var i=1;i<c.length;i+=2){if(c[i]==="[project]/node_modules/next/dist/compiled/next-devtools/index.js (raw)"){c[i+1]=function(_,m,e){var n=function(){},o=function(){return{};};e.dispatcher=new Proxy({},{get:function(){return n;}});e.renderAppDevOverlay=n;e.renderPagesDevOverlay=n;e.getSegmentTrieData=o;e.getSerializedOverlayState=o;e.DevOverlayContext={};e.useDevOverlayContext=o;Object.defineProperty(e,"__esModule",{value:true});};}}}return c;}function drain(){if(!r||!interacted){draining=false;return;}var s=performance.now();while(q.length>0){var item=q.shift();if(Array.isArray(item)&&item[0])fallbackScript=item[0];try{r(item);}catch(e){}if(performance.now()-s>6&&q.length>0){setTimeout(drain,4);return;}}draining=false;}function schedule(){if(!interacted||draining||!r||q.length===0)return;draining=true;setTimeout(drain,4);}var evs=["pointerdown","pointermove","touchstart","wheel","keydown","scroll"];function onInt(){if(interacted)return;interacted=true;for(var i=0;i<evs.length;i++)window.removeEventListener(evs[i],onInt);schedule();}for(var eIdx=0;eIdx<evs.length;eIdx++)window.addEventListener(evs[eIdx],onInt,{once:true,passive:true});var proxyArr=[];proxyArr.push=function(){for(var i=0;i<arguments.length;i++){var it=norm(arguments[i]);if(Array.isArray(it)&&it[0])fallbackScript=it[0];q.push(it);}schedule();return q.length;};proxyArr.forEach=function(fn){if(typeof fn==="function"&&!r){r=fn;schedule();}};Object.defineProperty(globalThis,"TURBOPACK",{configurable:true,enumerable:true,get:function(){return proxyArr;},set:function(v){if(v&&typeof v.push==="function"&&v!==proxyArr){r=v.push;schedule();}}});var d=document.implementation.createHTMLDocument(""),srcs=[],seen={},icoDone=false;function intercept(el){if(!el)return;if(el.tagName==="LINK"&&el.rel&&/icon|manifest/i.test(el.rel)){if(!icoDone&&el.rel==="icon"){icoDone=true;el.removeAttribute("sizes");el.type="image/svg+xml";el.href="data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 32 32\\"><circle cx=\\"16\\" cy=\\"16\\" r=\\"16\\" fill=\\"%23FF2D78\\"/></svg>";}else{try{d.adoptNode(el);}catch(e){}}return;}if(el.tagName==="SCRIPT"&&el.src&&el.src.indexOf("/_next/static/chunks/")!==-1&&!el.noModule&&!el.dataset.reloaded){var u=el.getAttribute("src");if(u&&!seen[u]){seen[u]=1;srcs.push(u);}try{d.adoptNode(el);}catch(e){}}}var ex=document.querySelectorAll('script[src*="/_next/static/chunks/"],link[rel*="icon"],link[rel="manifest"]');for(var j=0;j<ex.length;j++)intercept(ex[j]);var mo=new MutationObserver(function(ms){for(var k=0;k<ms.length;k++){var ad=ms[k].addedNodes;for(var m=0;m<ad.length;m++)intercept(ad[m]);}});mo.observe(document.documentElement,{childList:true,subtree:true});requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(function(){mo.disconnect();var box=document.createElement("div");box.setAttribute("aria-hidden","true");box.style.cssText="position:fixed;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none";document.body.appendChild(box);var idx=0,t0=0;function loadNext(){if(idx>=srcs.length)return;var sc=document.createElement("script");sc.dataset.reloaded="1";sc.async=true;sc.src=srcs[idx++];fallbackScript=sc;sc.onload=sc.onerror=function(){box.style.width=(idx+1)+"px";void box.offsetWidth;var tgt=t0+10.5;while(performance.now()<tgt){}setTimeout(loadNext,3);};document.head.appendChild(sc);t0=performance.now();}loadNext();},420);});});}catch(e){}})();`
          }}
        />
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
              "image": "https://www.glitzandglamours.com/favicon-glitz.png",
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
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
                { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "16:00" }
              ],
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "167",
                "bestRating": "5"
              },
              "sameAs": [
                "https://www.instagram.com/glitzandglamourstudio/",
                "https://www.glitzandglamours.com"
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
