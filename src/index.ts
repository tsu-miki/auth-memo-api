import { serve } from '@hono/node-server'
import { Hono } from 'hono'

// メモ1件の形。ステップ4で「誰のメモか (ownerId)」を追加する予定
type Memo = {
  id: string
  content: string
  createdAt: string
}

// 保存先はメモリ上の Map（サーバーを再起動すると消える）
const memos = new Map<string, Memo>()

const app = new Hono()

// 一覧: GET /memos
app.get('/memos', (c) => {
  return c.json([...memos.values()])
})

// 作成: POST /memos  body: { "content": "..." }
app.post('/memos', async (c) => {
  const body = await c.req.json<{ content?: unknown }>()
  if (typeof body.content !== 'string' || body.content === '') {
    return c.json({ error: 'content is required' }, 400)
  }
  const memo: Memo = {
    id: crypto.randomUUID(),
    content: body.content,
    createdAt: new Date().toISOString(),
  }
  memos.set(memo.id, memo)
  return c.json(memo, 201)
})

// 1件取得: GET /memos/:id
app.get('/memos/:id', (c) => {
  const memo = memos.get(c.req.param('id'))
  if (!memo) return c.json({ error: 'not found' }, 404)
  return c.json(memo)
})

// 削除: DELETE /memos/:id
app.delete('/memos/:id', (c) => {
  const deleted = memos.delete(c.req.param('id'))
  if (!deleted) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`listening on http://localhost:${info.port}`)
})
