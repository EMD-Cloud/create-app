import type { Metadata } from 'next'
import Providers from './Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'EMD Next.js App',
  description: 'Welcome to your EMD Cloud Next.js application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
