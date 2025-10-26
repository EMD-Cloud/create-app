'use client'

import { useState } from 'react'
import { useAuth } from '@emd-cloud/react-components'
import styles from './page.module.scss'

export default function Home(): JSX.Element {
  const [count, setCount] = useState<number>(0)
  const { userInfo } = useAuth()

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Welcome to EMD Cloud</p>
        <p>Your Next.js application is ready to go!</p>
        {userInfo && <p>Logged in as: {userInfo.login}</p>}
      </div>

      <div className={styles.center}>
        <div className={styles.card}>
          <h2>Getting Started</h2>
          <p>Edit <code>app/page.tsx</code> and save to see changes</p>
          <button onClick={() => setCount((c) => c + 1)}>
            Count: {count}
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Powered by EMD Cloud and Next.js</p>
      </footer>
    </main>
  )
}
