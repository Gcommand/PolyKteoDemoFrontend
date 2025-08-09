import { NextResponse } from "next/server";

// Backend URLs - kept private in route files
const BACKEND_URLS = {
  dev: 'http://localhost:5000',
  staging: 'https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net',
  'gary-testing': 'https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net',
  'gt-container-app2': 'https://gt-container-app2.gentlewater-d7538817.southeastasia.azurecontainerapps.io',
  'prod': 'http://dpt-x-10630:5000'
} as const;

// Change this to switch environments
// const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'dev';
const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'prod';

export async function GET() {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[${requestId}] [POLY_ASSIGNEES API] Request started at ${new Date().toISOString()}`);
  console.log(`[${requestId}] [POLY_ASSIGNEES API] Environment: ${ACTIVE_ENV}`);
  console.log(`[${requestId}] [POLY_ASSIGNEES API] Backend URL: ${BACKEND_URLS[ACTIVE_ENV]}`);

  try {
    const fullUrl = `${BACKEND_URLS[ACTIVE_ENV]}/poly_assignees`;
    console.log(`[${requestId}] [POLY_ASSIGNEES API] Making request to: ${fullUrl}`);

    const fetchStartTime = Date.now();
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PolyKteoFrontend/1.0'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const fetchEndTime = Date.now();
    console.log(`[${requestId}] [POLY_ASSIGNEES API] Backend response received in ${fetchEndTime - fetchStartTime}ms`);
    console.log(`[${requestId}] [POLY_ASSIGNEES API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] [POLY_ASSIGNEES API] Backend error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log(`[${requestId}] [POLY_ASSIGNEES API] Success! Total time: ${totalTime}ms`);
    console.log(`[${requestId}] [POLY_ASSIGNEES API] Response data type:`, Array.isArray(data) ? `Array with ${data.length} items` : typeof data);

    return NextResponse.json(data);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] [POLY_ASSIGNEES API] Error after ${totalTime}ms:`, error);
    
    if (error instanceof Error) {
      console.error(`[${requestId}] [POLY_ASSIGNEES API] Error name: ${error.name}`);
      console.error(`[${requestId}] [POLY_ASSIGNEES API] Error message: ${error.message}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch poly assignees", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 