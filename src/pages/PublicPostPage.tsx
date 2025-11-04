// src/pages/PublicPostPage.tsx
import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()
type Post = Schema['PublicPost']['type']

export default function PublicPostPage() {
  const [items, setItems] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')

  // リアルタイム購読
  useEffect(() => {
    const sub = client.models.PublicPost
      // .observeQuery() // jwtで検索なので自分の投稿だけ見れる
      .observeQuery({ authMode: 'apiKey' }) // ★ 署名をapiKeyに
      .subscribe(({ items }) => setItems(items))
    return () => sub.unsubscribe()
  }, [])

  const create = async () => {
    if (!title.trim()) return

    try {
      await client.models.PublicPost.create({
        title,
        body,
        ...(category.trim() ? { category } : {}),
      })

      // 成功時の後処理
      setTitle('')
      setBody('')
      setCategory('')
    } catch (err: any) {
      console.error('PublicPost.create failed:', err)

      // AmplifyのGraphQL系エラーは often err.errors[0].message に入っている
      const message =
        err?.errors?.[0]?.message ||
        err?.message ||
        (typeof err === 'string' ? err : 'Unknown error')

      if (message.includes('Not Authorized') || message.includes('Unauthorized')) {
        alert('作成できませんでした。ログインが必要な操作か、権限がありません。')
      } else if (message.includes('NetworkError') || message.includes('fetch')) {
        alert('ネットワークエラーが発生しました。接続を確認してください。')
      } else if (message.includes('expired')) {
        alert('APIキーの有効期限が切れている可能性があります。sandbox を再実行してください。')
      } else {
        alert(`投稿作成中にエラーが発生しました:\n${message}`)
      }
    }
  }

  console.log(items)

  return (
    <div>
      <h1>Public Posts（匿名閲覧OK）</h1>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr' }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
        <input placeholder="Category (optional)" value={category} onChange={e=>setCategory(e.target.value)} />
        <button onClick={create}>Create</button>
      </div>

      <hr style={{ margin: '24px 0' }} />

      <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
        {items.map(p => (
          <li key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{p.title}</div>
            {p.category && <div style={{ fontSize: 12, opacity: 0.7 }}>Category: {p.category}</div>}
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{p.body}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
