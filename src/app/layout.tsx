import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
// import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    template: '%s - Tactix',
    default: 'Tactix - Football Analysis Platform',
  },
  description:
    'Advanced football analysis platform for coaches, analysts, and scouts. Visualize tactics, track player performance, and gain deep insights into match statistics with Tactix.',
  keywords: [
    'Tactix',
    'Football Analysis',
    'Soccer Analytics',
    'Match Statistics',
    'Coaching Tools',
    'Tactical Board',
    'Player Performance',
    'Sports Data',
  ],
  icons: [
    {
      rel: 'icon',
      type: 'image/svg',
      sizes: '32x32',
      url: '/og-images/favicon.svg',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      url: '/og-images/favicon-96x96.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/og-images/apple-touch-icon.png',
    },
  ],
  authors: [
    {
      name: 'Fady Emad',
      url: 'https://github.com/FadyEmad01',
    },
  ],
  publisher: 'Tactix',
  openGraph: {
    title: 'Tactix - Football Analysis Platform',
    description:
      'Advanced football analysis platform for coaches, analysts, and scouts. Visualize tactics, track player performance, and gain deep insights into match statistics.',
    url: 'https://tactix-front.vercel.app/',
    siteName: 'Tactix',
    images: [
      {
        url: '/og-images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tactix Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@TactixApp',
    title: 'Tactix - Football Analysis Platform',
    description:
      'Advanced football analysis platform for coaches, analysts, and scouts. Visualize tactics and gain deep insights.',
    images: [
      {
        url: '/og-images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tactix Dashboard Preview',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* coss.com toast */}
          <ToastProvider>
            {children}
          </ToastProvider>


          {/* shadcn toast */}
          {/* <Toaster position="bottom-right"/> */}

        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
