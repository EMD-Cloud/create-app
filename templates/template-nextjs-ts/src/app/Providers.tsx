"use client"

import { ApplicationProvider } from '@emd-cloud/react-components'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationProvider
      app={process.env.NEXT_PUBLIC_EMD_APP_ID || 'your-app-id'}
      apiUrl="https://api.emd.one"
    >
      {children}
    </ApplicationProvider>
  )
}
