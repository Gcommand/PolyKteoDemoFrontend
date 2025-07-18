const NextServer = require('next/dist/server/next-server').default
const http = require('http')
const path = require('path')

// Ensure logs are flushed immediately
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function flushLogs() {
  if (process.stdout.write) {
    process.stdout.write('');
  }
  if (process.stderr.write) {
    process.stderr.write('');
  }
}

console.log = function(...args) {
  originalLog.apply(console, args);
  flushLogs();
};

console.error = function(...args) {
  originalError.apply(console, args);
  flushLogs();
};

console.warn = function(...args) {
  originalWarn.apply(console, args);
  flushLogs();
};

console.info = function(...args) {
  originalInfo.apply(console, args);
  flushLogs();
};

// Simplified URL validation for security
function validateUrlPath(url) {
  if (!url) return false;
  
  // Skip validation for Next.js static assets and API routes
  if (url.startsWith('/_next/') || url.startsWith('/api/') || url.startsWith('/favicon.ico')) {
    return true;
  }
  
  // Check for control characters (basic security)
  const controlCharPattern = /[\x00-\x1F\x7F]/;
  return !controlCharPattern.test(url);
}

process.env.NODE_ENV = 'production'
process.chdir(__dirname)

// Graceful shutdown
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0))
  process.on('SIGINT', () => process.exit(0))
}

let handler

const server = http.createServer(async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Basic request logging (less verbose for static files)
    if (req.url && !req.url.startsWith('/_next/static')) {
      console.log(`[${requestId}] ${req.method} ${req.url}`)
    }
    
    // Security validation
    if (!validateUrlPath(req.url)) {
      console.warn(`[${requestId}] [SECURITY] Blocked request: ${req.url}`);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      return;
    }
    
    // Enhanced logging for API routes only
    if (req.url && req.url.startsWith('/api/')) {
      console.log(`[${requestId}] [API] ${req.url}`)
    }
    
    await handler(req, res)
  } catch (err) {
    console.error(`[${requestId}] [ERROR] ${err.message}`, err);
    if (!res.headersSent) {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }
})

const currentPort = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || 'localhost'

server.listen(currentPort, (err) => {
  if (err) {
    console.error("Failed to start server", err)
    process.exit(1)
  }
  
  console.log(`[SERVER] Starting Next.js server...`)
  
  // Use the default Next.js server configuration
  const nextServer = new NextServer({
    hostname,
    port: currentPort,
    dir: path.join(__dirname),
    dev: false,
    customServer: false,
  })
  
  handler = nextServer.getRequestHandler()

  console.log(`[SERVER] Listening on port ${currentPort}, url: http://${hostname}:${currentPort}`)
}) 