import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'justdo',
  password: process.env.PGPASSWORD || 'justdo',
  database: process.env.PGDATABASE || 'justdo',
})

const app = express()
app.use(cors())
app.use(express.json())

const SELECT_COLS = `id, title, description, category, to_char("date", 'YYYY-MM-DD') AS "date", to_char("time", 'HH24:MI') AS "time", location, status, tags, created_at AS "createdAt"`

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/activities', async (_req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT ${SELECT_COLS} FROM activities ORDER BY "date", "time"`
    )
    res.json(r.rows)
  } catch (e) { next(e) }
})

app.post('/activities', async (req, res, next) => {
  try {
    const { title, description = '', category, date, time, location = null, tags = [] } = req.body
    if (!title || !category || !date || !time) {
      return res.status(400).json({ error: 'title, category, date, time are required' })
    }
    const id = `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const r = await pool.query(
      `INSERT INTO activities (id, title, description, category, "date", "time", location, status, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8)
       RETURNING ${SELECT_COLS}`,
      [id, title, description, category, date, time, location, tags]
    )
    res.status(201).json(r.rows[0])
  } catch (e) { next(e) }
})

app.patch('/activities/:id', async (req, res, next) => {
  try {
    const { status, title, description, category, date, time, location, tags } = req.body
    const r = await pool.query(
      `UPDATE activities SET
         status = COALESCE($2, status),
         title = COALESCE($3, title),
         description = COALESCE($4, description),
         category = COALESCE($5, category),
         "date" = COALESCE($6::date, "date"),
         "time" = COALESCE($7::time, "time"),
         location = COALESCE($8, location),
         tags = COALESCE($9, tags)
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [req.params.id, status, title, description, category, date, time, location, tags]
    )
    if (!r.rowCount) return res.status(404).json({ error: 'not found' })
    res.json(r.rows[0])
  } catch (e) { next(e) }
})

app.delete('/activities/:id', async (req, res, next) => {
  try {
    const r = await pool.query('DELETE FROM activities WHERE id=$1', [req.params.id])
    if (!r.rowCount) return res.status(404).json({ error: 'not found' })
    res.status(204).end()
  } catch (e) { next(e) }
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

const port = Number(process.env.PORT || 3000)

async function waitForDb() {
  for (let i = 0; i < 60; i++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('database not reachable')
}

waitForDb()
  .then(() => app.listen(port, () => console.log(`api listening on :${port}`)))
  .catch(e => { console.error(e); process.exit(1) })
