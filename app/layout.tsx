import '@/styles/globals.css'
import { LanguageProvider } from '@/context/LanguageContext'

export const metadata = {
  title: 'Padria - Real Estate',
  description: 'Find your dream home with Padria Real Estate. Premium real estate listings and expert guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
