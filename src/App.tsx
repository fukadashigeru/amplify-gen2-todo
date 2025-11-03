import { useEffect, useMemo, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource' // ← import *type* が大事

const client = generateClient<Schema>()

type Todo = Schema['Todo']['type']  // 型を短縮参照

export default function App() {
  const [items, setItems] = useState<Todo[]>([])
  const [text, setText] = useState('')

  // 1) リアルタイム購読で一覧を常に最新化
  useEffect(() => {
    const sub = client.models.Todo
      .observeQuery() // ここでサーバー→クライアントの双方向同期
      .subscribe(({ items }) => {
        // UI側で必要なら並べ替え
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setItems(sorted)
      })
    return () => sub.unsubscribe() // クリーンアップを忘れずに
  }, [])

  // 2) 作成（楽観的UIつき）
  const add = async () => {
    const title = text.trim()
    if (!title) return
    setText('')

    // 楽観的UI（先に画面に反映 → 失敗したら戻す）
    const optimistic: Todo = {
      id: `optimistic-${Date.now()}`,
      content: title,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // owner ルールを使っている場合、owner フィールドはサーバー側で埋まる想定
    }
    setItems(prev => [optimistic, ...prev])
    try {
      await client.models.Todo.create({ content: title, isDone: false })
      // 成功すれば observeQuery の通知で正しいレコードが流れてくるので何もしなくてOK
    } catch (e) {
      // 失敗したら楽観的アイテムを消す
      setItems(prev => prev.filter(x => x.id !== optimistic.id))
      alert('作成に失敗しました')
    }
  }

  // 3) 更新（トグルで完了/未完了）
  const toggleDone = async (todo: Todo) => {
    // 楽観的UI
    setItems(prev =>
      prev.map(x => (x.id === todo.id ? { ...x, isDone: !x.isDone } : x))
    )
    try {
      await client.models.Todo.update({ id: todo.id, isDone: !todo.isDone })
    } catch (e) {
      // 差し戻し
      setItems(prev =>
        prev.map(x => (x.id === todo.id ? { ...x, isDone: todo.isDone } : x))
      )
      alert('更新に失敗しました')
    }
  }

  // 4) 削除
  const remove = async (todo: Todo) => {
    // 楽観的UIで一旦消す
    const backup = items
    setItems(prev => prev.filter(x => x.id !== todo.id))
    try {
      await client.models.Todo.delete({ id: todo.id })
    } catch (e) {
      setItems(backup)
      alert('削除に失敗しました')
    }
  }

  // 5)（任意）フィルタリングや検索はクライアント側でまず実装
  const undone = useMemo(() => items.filter(x => !x.isDone), [items])
  const done = useMemo(() => items.filter(x => x.isDone), [items])

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
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
