
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: "DocuHaul",
    template: "%s | DocuHaul",
  },
  description: 'DocuHaul: AI-powered creation of VIN labels, NVIS certificates, and Bills of Sale for trailer and vehicle manufacturers. Ensure compliance and streamline your workflow.',
  keywords: ["VIN", "NVIS", "Bill of Sale", "Vehicle Documentation", "Trailer Manufacturing", "AI Documentation", "Vehicle Compliance", "FMVSS", "CMVSS", "GenAI"],
  authors: [{ name: "Firebase", url: "https://firebase.google.com" }],
  creator: "Firebase",
  publisher: "Firebase",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "DocuHaul: AI-Powered Vehicle Documentation",
    description: "Automate the creation, validation, and management of essential vehicle documents like VIN labels, NVIS certificates, and Bills of Sale.",
    siteName: "DocuHaul",
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocuHaul - AI Vehicle Documentation',
    description: 'Automate vehicle documentation with the power of Generative AI.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
