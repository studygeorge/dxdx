import './globals.css'
import { AuthProvider } from './hooks/useAuth'

export const metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production' 
      ? 'https://dxcapital-ai.com' 
      : 'http://localhost:3000'
  ),
  
  title: {
    default: 'DXCAPITAL - Crypto Platform | Professional Trading & Staking',
    template: '%s | DXCAPITAL'
  },
  
  description: 'Buy & Exchange Crypto Token Instantly with DXCAPITAL. Professional trading platform with staking, referral rewards, and 24/7 support.',
  
  keywords: [
    'DXCAPITAL',
    'crypto exchange',
    'cryptocurrency trading',
    'staking',
    'crypto investment',
    'bitcoin',
    'ethereum',
    'professional trading',
    'referral rewards'
  ],
  
  authors: [
    {
      name: 'DXCAPITAL',
      url: 'https://dxcapital-ai.com'
    }
  ],
  
  creator: 'DXCAPITAL',
  publisher: 'DXCAPITAL',
  
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', url: '/favicon/favicon-96x96.png' }
    ]
  },
  
  manifest: '/favicon/site.webmanifest',
  
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ru_RU'],
    url: 'https://dxcapital-ai.com',
    title: 'DXCAPITAL - Professional Crypto Exchange Platform',
    description: 'Buy & Exchange Crypto Token Instantly. Professional trading with staking rewards.',
    siteName: 'DXCAPITAL',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DXCAPITAL - Professional Crypto Exchange Platform',
        type: 'image/jpeg'
      },
      {
        url: '/og-image-square.jpg',
        width: 800,
        height: 800,
        alt: 'DXCAPITAL Logo',
        type: 'image/jpeg'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    site: '@dxcapital',
    creator: '@dxcapital',
    title: 'DXCAPITAL - Professional Crypto Exchange Platform',
    description: 'Buy & Exchange Crypto Token Instantly. Professional trading with staking rewards.',
    images: ['/twitter-image.jpg']
  },
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  },
  
  alternates: {
    canonical: 'https://dxcapital-ai.com',
    languages: {
      'en-US': 'https://dxcapital-ai.com',
      'ru-RU': 'https://dxcapital-ai.com'
    }
  },
  
  category: 'finance',
  
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" 
        />
        
        <link rel="preconnect" href="https://dxcapital-ai.com" />
        <link rel="dns-prefetch" href="https://dxcapital-ai.com" />
        
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DXCAPITAL" />
        
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}