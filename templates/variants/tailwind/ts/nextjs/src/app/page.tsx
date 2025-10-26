'use client'

import { useState } from 'react'
import { useAuth } from '@emd-cloud/react-components'

export default function Home(): JSX.Element {
  const [count, setCount] = useState<number>(0)
  const { userInfo } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-4">
        <p className="text-lg font-semibold">Welcome to EMD Cloud</p>
        <p className="text-lg">Your Next.js application is ready to go!</p>
        {userInfo && <p className="text-sm text-muted-foreground">Logged in as: {userInfo.login}</p>}
      </div>

      <div className="flex items-center justify-center">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Edit <code className="bg-muted px-2 py-1 rounded text-sm">app/page.tsx</code> and save to see changes
          </p>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Count: {count}
          </button>
        </div>
      </div>

      <footer className="flex items-center justify-center p-4 border-t w-full text-center text-sm text-muted-foreground">
        <p>Powered by EMD Cloud and Next.js</p>
      </footer>
    </main>
  )
}
