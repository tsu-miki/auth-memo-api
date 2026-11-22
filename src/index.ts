import { serve } from '@hono/node-server'
import { Hono } from 'hono'

type Memo = {
  id: string
  content: string
  createdAt: string
}

const memos = new Map<string, Memo>()

const app = new Hono()

app.get('/memos', (c) => {
  return c.json([...memos.values()])
})

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

app.get('/memos/:id', (c) => {
  const memo = memos.get(c.req.param('id'))
  if (!memo) return c.json({ error: 'not found' }, 404)
  return c.json(memo)
})

app.delete('/memos/:id', (c) => {
  const deleted = memos.delete(c.req.param('id'))
  if (!deleted) return c.json({ error: 'not found' }, 404)
  return c.body(null, 204)
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`listening on http://localhost:${info.port}`)
})
