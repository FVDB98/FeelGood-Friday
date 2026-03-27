import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import pg from 'pg'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: false })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in .env or .env.local')
}

function createDatabaseConfig(nextDatabaseUrl) {
  const { hostname } = new URL(nextDatabaseUrl)
  const useSsl = hostname !== 'localhost' && hostname !== '127.0.0.1'

  return {
    connectionString: nextDatabaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  }
}

const schemaSql = await fs.readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')
const { Client } = pg
const client = new Client(createDatabaseConfig(databaseUrl))

try {
  await client.connect()
  await client.query(schemaSql)
  console.log('Database schema applied successfully.')
} finally {
  await client.end()
}
