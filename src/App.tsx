// src/App.tsx
import { useState } from 'react'
import TodoPage from './pages/TodoPage'
import PublicPostPage from './pages/PublicPostPage'

type TabKey = 'todo' | 'public'

export default function App() {
  const [tab, setTab] = useState<TabKey>('todo')

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <nav role="tablist" aria-label="Main tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <TabButton active={tab === 'todo'} onClick={() => setTab('todo')}>
          ToDo
        </TabButton>
        <TabButton active={tab === 'public'} onClick={() => setTab('public')}>
          PublicPost
        </TabButton>
      </nav>

      <section role="tabpanel" aria-labelledby={tab}>
        {tab === 'todo' ? <TodoPage /> : <PublicPostPage />}
      </section>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        border: active ? '1px solid #111827' : '1px solid #e5e7eb',
        background: active ? '#111827' : '#fff',
        color: active ? '#fff' : '#111827',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}
