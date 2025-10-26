import { useState } from 'react'
import { ApplicationProvider, useAuth } from '@emd-cloud/react-components'
import './App.scss'

function AppContent(): JSX.Element {
  const [count, setCount] = useState<number>(0)
  const { userInfo } = useAuth()

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to EMD Cloud</h1>
        <p>Your application is ready to go!</p>
        {userInfo && <p>Logged in as: {userInfo.login}</p>}

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </header>
    </div>
  )
}

function App(): JSX.Element {
  return (
    <ApplicationProvider
      app={import.meta.env.VITE_EMD_APP_ID || 'your-app-id'}
      apiUrl="https://api.emd.one"
      authToken={localStorage.getItem('emd_auth_token') || undefined}
    >
      <AppContent />
    </ApplicationProvider>
  )
}

export default App
