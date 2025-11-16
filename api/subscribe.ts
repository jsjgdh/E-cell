import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI as string
let client: MongoClient | null = null

async function getClient() {
  if (client) return client
  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  })
  await client.connect()
  return client
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const { email } = req.body || {}
  if (typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email' })
    return
  }
  try {
    const c = await getClient()
    const db = c.db('e_cell')
    const collection = db.collection('emails')
    const doc = { email, createdAt: new Date() }
    await collection.insertOne(doc)
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to save' })
  }
}