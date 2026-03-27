import 'dotenv/config'
import http from 'http'
import mysql from 'mysql2'
import { getAllPackages, getAllCustomers } from './db/queries.js'


//mysql connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
})


db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection failed:', err.message)
  } else {
    console.log('Connected to MySQL!')
    connection.release()
  }
})

// ── HELPERS ──
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => resolve(JSON.parse(body || '{}')))
  })
}

// ── SERVER ──
const server = http.createServer(async (req, res) => {
  console.log(req.method, req.url)  // ← shows every request in terminal
  const url = req.url
  const method = req.method


if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }  

  //query routes
  if (method === 'GET' && url === '/qry_all_packages') {
    getAllPackages(db, (err, results) => {
    if (err) {
      return sendJSON(res, 500, { error: 'Database error' });
    }
    if (results.length === 0) {
      return sendJSON(res, 404, { message: 'No packages found' });
    }
    sendJSON(res, 200, results);
  });
  return;
  }

  // ── 404 ──
  res.writeHead(404)
  res.end('Page not found')
})

server.listen(3000, () => console.log('Server running on http://localhost:3000'))