import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { hashPassword } from './password.js'

type User = {
  id: string
  username: string
  passwordHash: string
}

type Memo = {
  id: string
  content: string
  createdAt: string
}

const users = new Map<string, User>()
const memos = new Map<string, Memo>()

const app = new Hono()

app.post('/users', async (c) => {
  const body = await c.req.json<{ username?: unknown; password?: unknown }>()
  if (typeof body.username !== 'string' || body.username === '') {
    return c.json({ error: 'username is required' }, 400)
  }
  if (typeof body.password !== 'string' || body.password.length < 8) {
    return c.json({ error: 'password must be at least 8 characters' }, 400)
  }
  if (users.has(body.username)) {
    return c.json({ error: 'username already taken' }, 409)
  }
  const user: User = {
    id: crypto.randomUUID(),
    username: body.username,
    passwordHash: await hashPassword(body.password),
  }
  users.set(user.username, user)
  return c.json({ id: user.id, username: user.username }, 201)
})

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
