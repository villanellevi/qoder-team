const http = require('http')
const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const PORT = 3457
const SERVER_DIR = path.resolve(__dirname)
const HTML_PATH = path.join(SERVER_DIR, 'dashboard.html')

let serverProcess = null
let serverLogs = []
const MAX_LOGS = 200

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`
  console.log(line)
  serverLogs.push(line)
  if (serverLogs.length > MAX_LOGS) serverLogs.shift()
}

function getPidOnPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port}`, (err, stdout) => {
      resolve(err ? null : stdout.trim())
    })
  })
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port}`, (err) => resolve(!err))
  })
}

function startServer() {
  return new Promise((resolve, reject) => {
    if (serverProcess) {
      return resolve({ status: 'already_running' })
    }

    serverProcess = spawn('npm', ['run', 'start:dev'], {
      cwd: SERVER_DIR,
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    serverProcess.stdout.on('data', (data) => {
      data.toString().split('\n').filter(l => l.trim()).forEach(l => log(`[OUT] ${l}`))
    })

    serverProcess.stderr.on('data', (data) => {
      data.toString().split('\n').filter(l => l.trim()).forEach(l => log(`[ERR] ${l}`))
    })

    serverProcess.on('close', (code) => {
      log(`后端进程退出，代码: ${code}`)
      serverProcess = null
    })

    serverProcess.on('error', (err) => {
      log(`启动失败: ${err.message}`)
      reject(err)
    })

    setTimeout(() => resolve({ status: 'started' }), 2000)
  })
}

function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM')
      serverProcess = null
    }
    exec('lsof -ti:3000 | xargs kill -9 2>/dev/null', () => {
      log('后端已停止')
      resolve({ status: 'stopped' })
    })
  })
}

const htmlContent = fs.readFileSync(HTML_PATH, 'utf-8')

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.writeHead(200)
    res.end(htmlContent)
    return
  }

  if (req.url === '/api/status') {
    const pid = await getPidOnPort(3000)
    res.writeHead(200)
    res.end(JSON.stringify({ running: !!pid, pid }))
    return
  }

  if (req.url === '/api/logs') {
    res.writeHead(200)
    res.end(JSON.stringify({ logs: serverLogs.slice(-50) }))
    return
  }

  if (req.url === '/api/start' && req.method === 'POST') {
    const running = await isPortInUse(3000)
    if (running) {
      res.writeHead(200)
      res.end(JSON.stringify({ status: 'already_running', message: '服务已经在运行中' }))
      return
    }
    try {
      await startServer()
      res.writeHead(200)
      res.end(JSON.stringify({ status: 'started', message: '服务已启动' }))
    } catch (e) {
      res.writeHead(500)
      res.end(JSON.stringify({ status: 'error', message: e.message }))
    }
    return
  }

  if (req.url === '/api/stop' && req.method === 'POST') {
    const result = await stopServer()
    res.writeHead(200)
    res.end(JSON.stringify({ ...result, message: '服务已停止' }))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log('\n  Qoder Team Dashboard 已启动')
  console.log(`  打开浏览器访问: http://localhost:${PORT}\n`)
})
