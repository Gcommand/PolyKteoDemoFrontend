const NextServer = require('next/dist/server/next-server').default
const http = require('http')
const path = require('path')

// Ensure logs are flushed immediately by overriding console methods
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

// Security: Function to validate URL paths and reject control characters
function validateUrlPath(url) {
  // Skip validation for Next.js static assets to prevent blocking legitimate resources
  if (url && (url.startsWith('/_next/static') || url.startsWith('/_next/image'))) {
    return true;
  }
  
  // Check for control characters (0x00-0x1F and 0x7F)
  // These characters should not appear in valid URL paths
  const controlCharPattern = /[\x00-\x1F\x7F]/;
  
  if (controlCharPattern.test(url)) {
    return false;
  }
  
  // Additional security checks can be added here
  // For example, checking for suspicious patterns or encoding
  
  return true;
}

// Security: Send appropriate error response for invalid URLs
function sendSecurityErrorResponse(res, requestId, reason) {
  console.warn(`[${requestId}] [SECURITY] Blocked request: ${reason}`);
  res.writeHead(400, {
    'Content-Type': 'text/plain',
    'X-Security-Error': 'Invalid URL path'
  });
  res.end('Bad Request: Invalid URL path');
}

process.env.NODE_ENV = 'production'
process.chdir(__dirname)

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0))
  process.on('SIGINT', () => process.exit(0))
}

let handler

const server = http.createServer(async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Log incoming requests for debugging
    console.log(`[${requestId}] [SERVER] ${new Date().toISOString()} - ${req.method} ${req.url}`)
    
    // Security: Validate URL path before processing
    if (!validateUrlPath(req.url)) {
      sendSecurityErrorResponse(res, requestId, `Control characters detected in URL: ${req.url}`);
      return;
    }
    
    // Add request logging to capture API route execution
    if (req.url && req.url.startsWith('/api/')) {
      console.log(`[${requestId}] [SERVER] API route detected: ${req.url}`)
      console.log(`[${requestId}] [SERVER] Request headers:`, Object.keys(req.headers))
    }
    
    // Override res.write and res.end to capture response data
    const originalWrite = res.write;
    const originalEnd = res.end;
    let responseData = '';
    
    res.write = function(chunk, encoding) {
      if (chunk) {
        responseData += chunk.toString();
      }
      return originalWrite.apply(this, arguments);
    };
    
    res.end = function(chunk, encoding) {
      if (chunk) {
        responseData += chunk.toString();
      }
      
      const requestDuration = Date.now() - requestStartTime;
      console.log(`[${requestId}] [SERVER] Response completed in ${requestDuration}ms`)
      
      if (req.url && req.url.startsWith('/api/')) {
        console.log(`[${requestId}] [SERVER] API response status: ${res.statusCode}`)
        if (responseData.length > 0 && responseData.length < 1000) {
          console.log(`[${requestId}] [SERVER] API response preview:`, responseData.substring(0, 200))
        }
      }
      
      return originalEnd.apply(this, arguments);
    };
    
    await handler(req, res)
  } catch (err) {
    const requestDuration = Date.now() - requestStartTime;
    console.error(`[${requestId}] [SERVER] Error handling request after ${requestDuration}ms:`, err);
    res.statusCode = 500
    res.end('internal server error')
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
  
  const nextServer = new NextServer({
    hostname,
    port: currentPort,
    dir: path.join(__dirname),
    dev: false,
    customServer: false,
    conf: {"env":{},"webpack":null,"eslint":{"ignoreDuringBuilds":false},"typescript":{"ignoreBuildErrors":false,"tsconfigPath":"tsconfig.json"},"distDir":"./.next","cleanDistDir":true,"assetPrefix":"","configOrigin":"next.config.js","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["tsx","ts","jsx","js"],"target":"server","poweredByHeader":true,"compress":true,"analyticsId":"","images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":60,"formats":["image/webp"],"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","contentDispositionType":"inline","remotePatterns":[],"unoptimized":false},"devIndicators":{"buildActivity":true,"buildActivityPosition":"bottom-right"},"onDemandEntries":{"maxInactiveAge":15000,"pagesBufferLength":2},"amp":{"canonicalBase":""},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"optimizeFonts":true,"excludeDefaultMomentLocales":true,"serverRuntimeConfig":{},"publicRuntimeConfig":{},"reactStrictMode":true,"httpAgentOptions":{"keepAlive":true},"outputFileTracing":true,"staticPageGenerationTimeout":60,"swcMinify":true,"output":"standalone","experimental":{"clientRouterFilter":true,"clientRouterFilterRedirects":false,"preCompiledNextServer":false,"fetchCacheKeyPrefix":"","middlewarePrefetch":"flexible","optimisticClientCache":true,"manualClientBasePath":false,"legacyBrowsers":false,"newNextLinkBehavior":true,"cpus":1,"sharedPool":true,"isrFlushToDisk":true,"workerThreads":false,"pageEnv":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"disableOptimizedLoading":false,"gzipSize":true,"swcFileReading":true,"craCompat":false,"esmExternals":true,"appDir":true,"isrMemoryCacheSize":52428800,"fullySpecified":false,"outputFileTracingRoot":"/app","swcTraceProfiling":false,"forceSwcTransforms":false,"largePageDataBytes":128000,"enableUndici":true,"adjustFontFallbacks":false,"adjustFontFallbacksWithSizeAdjust":false,"typedRoutes":false,"instrumentationHook":false,"trustHostHeader":false},"configFileName":"next.config.js"},
  })
  
  handler = nextServer.getRequestHandler()

  console.log(
    '[SERVER] Listening on port',
    currentPort,
    'url: http://' + hostname + ':' + currentPort
  )
}) 