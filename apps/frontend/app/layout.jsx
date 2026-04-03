import './globals.css';

export const metadata = {
  title: {
    default: 'CarVerify AI — Know Your Car\'s Truth',
    template: '%s | CarVerify AI',
  },
  description:
    'India\'s AI-powered used-car intelligence platform. Get instant vehicle history, risk analysis, maintenance cost estimates, and expert AI verdicts before you buy.',
  keywords: [
    'car verification',
    'vehicle history India',
    'used car check',
    'VIN check India',
    'car risk assessment',
    'AI car analysis',
  ],
  authors: [{ name: 'CarVerify AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://carverify.ai',
    siteName: 'CarVerify AI',
    title: 'CarVerify AI — Know Your Car\'s Truth',
    description:
      'AI-powered used-car intelligence. Vehicle history, risk scoring, maintenance estimates — all in one report.',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarVerify AI — Know Your Car\'s Truth',
    description: 'AI-powered used-car intelligence for India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="min-h-screen bg-surface-950 text-surface-100 font-sans antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn-primary"
        >
          Skip to main content
        </a>

        <div id="main-content" className="flex flex-col min-h-screen">
          {children}
        </div>

        {/* Toast container portal */}
        <div id="toast-root" />
      </body>
    </html>
  );
}
