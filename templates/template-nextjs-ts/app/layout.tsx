import type { Metadata } from 'next'
import { ApplicationProvider } from '@emd-cloud/react-components'
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
        <ApplicationProvider
          app={process.env.NEXT_PUBLIC_EMD_APP_ID || 'your-app-id'}
          apiUrl="https://api.emd.one"
        >
          {children}
        </ApplicationProvider>
      </body>
    </html>
  )
}
