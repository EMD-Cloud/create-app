import Providers from './Providers'
import './globals.scss'

export const metadata = {
  title: 'EMD Next.js App',
  description: 'Welcome to your EMD Cloud Next.js application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
