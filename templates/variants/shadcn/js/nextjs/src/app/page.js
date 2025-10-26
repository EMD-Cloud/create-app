'use client'

import { useState } from 'react'
import { useAuth } from '@emd-cloud/react-components'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [count, setCount] = useState(0)
  const { userInfo } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-4">
        <p className="text-lg font-semibold">Welcome to EMD Cloud</p>
        <p className="text-lg">Your Next.js application is ready to go!</p>
        {userInfo && <p className="text-sm text-muted-foreground">Logged in as: {userInfo.login}</p>}
      </div>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Edit <code className="bg-muted px-2 py-1 rounded text-sm">app/page.js</code> and save to see changes
            </p>
            <Button onClick={() => setCount((c) => c + 1)}>
              Count: {count}
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="flex items-center justify-center p-4 border-t w-full text-center text-sm text-muted-foreground">
        <p>Powered by EMD Cloud and Next.js</p>
      </footer>
    </main>
  )
}
