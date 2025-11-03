// src/Root.tsx
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import App from './App'

export default function Root() {
  return (
    <Authenticator formFields={{
      signUp: {
        username: { placeholder: 'メールアドレス' },
        password: { placeholder: 'パスワード（8文字以上）' },
      },
    }}>
      {({ signOut, user }) => (
        <div>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              background: '#f3f4f6',
            }}
          >
            <span>👤 {user?.username}</span>
            <button onClick={signOut}>Sign out</button>
          </header>
          <App />
        </div>
      )}
    </Authenticator>
  )
}
