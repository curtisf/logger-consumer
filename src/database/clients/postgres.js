const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.PGUSER || '<invaliduser>',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'logger',
  password: process.env.PGPASSWORD || ''
})

pool.on('error', e => {
  console.error('Postgres error', e)
})

module.exports = pool
