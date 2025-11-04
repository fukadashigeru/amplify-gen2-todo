// src/pages/TodoPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()
type Todo = Schema['Todo']['type']

export default function TodoPage() {
  const [items, setItems] = useState<Todo[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe(({ items }) => {
      const sorted = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setItems(sorted)
    })
    return () => sub.unsubscribe()
  }, [])

  const add = async () => {
    const title = text.trim()
    if (!title) return
    setText('')

    const optimistic: Todo = {
      id: `optimistic-${Date.now()}`,
      content: title,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setItems(prev => [optimistic, ...prev])
    try {
      await client.models.Todo.create({ content: title, isDone: false })
    } catch (e) {
      setItems(prev => prev.filter(x => x.id !== optimistic.id))
      alert('作成に失敗しました')
    }
  }

  const toggleDone = async (todo: Todo) => {
    setItems(prev => prev.map(x => (x.id === todo.id ? { ...x, isDone: !x.isDone } : x)))
    try {
      await client.models.Todo.update({ id: todo.id, isDone: !todo.isDone })
    } catch (e) {
      setItems(prev => prev.map(x => (x.id === todo.id ? { ...x, isDone: todo.isDone } : x)))
      alert('更新に失敗しました')
    }
  }

  const remove = async (todo: Todo) => {
    const backup = items
    setItems(prev => prev.filter(x => x.id !== todo.id))
    try {
      await client.models.Todo.delete({ id: todo.id })
    } catch (e) {
      setItems(backup)
      alert('削除に失敗しました')
    }
  }

  const undone = useMemo(() => items.filter(x => !x.isDone), [items])
  const done = useMemo(() => items.filter(x => x.isDone), [items])

  return (
    <div>
      <h1>Amplify Gen2 ToDo</h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やること"
          style={{ flex: 1 }}
        />
        <button onClick={add}>追加</button>
      </div>

      <h2 style={{ marginTop: 24 }}>未完了</h2>
      <ul>
        {undone.map(t => (
          <li key={t.id}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={t.isDone ?? false}
                onChange={() => toggleDone(t)}
              />
              <span>{t.content}</span>
              <button onClick={() => remove(t)} style={{ marginLeft: 'auto' }}>
                削除
              </button>
            </label>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 24 }}>完了</h2>
      <ul>
        {done.map(t => (
          <li key={t.id}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={t.isDone ?? false}
                onChange={() => toggleDone(t)}
              />
              <span style={{ textDecoration: 'line-through' }}>{t.content}</span>
              <button onClick={() => remove(t)} style={{ marginLeft: 'auto' }}>
                削除
              </button>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
