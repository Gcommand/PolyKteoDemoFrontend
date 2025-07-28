const NextServer = require('next/dist/server/next-server').default
const http = require('http')
const path = require('path')
const fs = require('fs')

// Optional file logging setup
const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING === 'true';
const LOG_DIR = process.env.LOG_DIR || './logs';
let logStream = null;
let errorStream = null;
let accessStream = null;

if (ENABLE_FILE_LOGGING) {
  // Ensure log directory exists
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  
  // Create log streams with rotation by date
  const today = new Date().toISOString().split('T')[0];
  logStream = fs.createWriteStream(path.join(LOG_DIR, `app-${today}.log`), { flags: 'a' });
  errorStream = fs.createWriteStream(path.join(LOG_DIR, `error-${today}.log`), { flags: 'a' });
  accessStream = fs.createWriteStream(path.join(LOG_DIR, `access-${today}.log`), { flags: 'a' });
}

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
  if (logStream) {
    logStream.write('');
  }
  if (errorStream) {
    errorStream.write('');
  }
  if (accessStream) {
    accessStream.write('');
  }
}

function formatLogEntry(level, args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  return `[${timestamp}] [${level}] ${message}\n`;
}

console.log = function(...args) {
  originalLog.apply(console, args);
  
  // Check if this is an access log
  const message = args.join(' ');
  if (message.startsWith('[ACCESS]')) {
    // Write access logs to dedicated access log file
    if (accessStream) {
      const cleanMessage = message.replace('[ACCESS] ', '');
      accessStream.write(cleanMessage + '\n');
    }
  } else {
    // Write regular logs to general log file
    if (logStream) {
      logStream.write(formatLogEntry('INFO', args));
    }
  }
  
  flushLogs();
};

console.error = function(...args) {
  originalError.apply(console, args);
  if (errorStream) {
    errorStream.write(formatLogEntry('ERROR', args));
  }
  if (logStream) {
    logStream.write(formatLogEntry('ERROR', args));
  }
  flushLogs();
};

console.warn = function(...args) {
  originalWarn.apply(console, args);
  if (logStream) {
    logStream.write(formatLogEntry('WARN', args));
  }
  flushLogs();
};

console.info = function(...args) {
  originalInfo.apply(console, args);
  if (logStream) {
    logStream.write(formatLogEntry('INFO', args));
  }
  flushLogs();
};

// Graceful cleanup
process.on('exit', () => {
  if (logStream) logStream.end();
  if (errorStream) errorStream.end();
  if (accessStream) accessStream.end();
});

process.on('SIGTERM', () => {
  if (logStream) logStream.end();
  if (errorStream) errorStream.end();
  if (accessStream) accessStream.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  if (logStream) logStream.end();
  if (errorStream) errorStream.end();
  if (accessStream) accessStream.end();
  process.exit(0);
});

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
  const startTime = Date.now();
  
  // Extract client information
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referrer = req.headers['referer'] || '-';
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  let responseSize = 0;
  
  res.end = function(chunk, encoding) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Standard access log format
    const accessLog = `${clientIP} - - [${new Date().toISOString()}] "${req.method} ${req.url} HTTP/${req.httpVersion}" ${res.statusCode} ${responseSize} "${referrer}" "${userAgent}" ${duration}ms [${requestId}]`;
    
    // Log to access log (if file logging enabled, this will also go to file)
    console.log(`[ACCESS] ${accessLog}`);
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  try {
    // Basic request logging (less verbose for static files)
    if (req.url && !req.url.startsWith('/_next/static')) {
      console.log(`[${requestId}] ${req.method} ${req.url} from ${clientIP}`)
    }
    
    // Security validation
    if (!validateUrlPath(req.url)) {
      console.warn(`[${requestId}] [SECURITY] Blocked request: ${req.url} from ${clientIP}`);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      return;
    }
    
    // Enhanced logging for API routes only
    if (req.url && req.url.startsWith('/api/')) {
      console.log(`[${requestId}] [API] ${req.url} from ${clientIP}`)
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