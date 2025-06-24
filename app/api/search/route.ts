import { NextRequest, NextResponse } from "next/server";

// Backend URLs - kept private in route files
const BACKEND_URLS = {
  dev: 'http://localhost:5000',
  staging: 'https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net',
  'gary-testing': 'https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net',
    'gt-container-app2': 'https://gt-container-app2.gentlewater-d7538817.southeastasia.azurecontainerapps.io'
} as const;

// Change this to switch environments
// const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'dev';
const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'gt-container-app2';

/**
 * Search API Route
 * 
 * Parameter Naming Convention:
 * - Frontend to API Route: Uses snake_case (e.g., current_page, tech_sector_id)
 * - API Route to Backend: Uses snake_case (e.g., current_page, tech_sector_id)
 * 
 * This ensures consistency in parameter naming across the entire stack.
 * The backend expects all parameters in snake_case format.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[${requestId}] [SEARCH API] Request started at ${new Date().toISOString()}`);
  console.log(`[${requestId}] [SEARCH API] Environment: ${ACTIVE_ENV}`);
  console.log(`[${requestId}] [SEARCH API] Backend URL: ${BACKEND_URLS[ACTIVE_ENV]}`);
  
  // Log system information for debugging
  console.log(`[${requestId}] [SEARCH API] Node.js version: ${process.version}`);
  console.log(`[${requestId}] [SEARCH API] Platform: ${process.platform}`);
  console.log(`[${requestId}] [SEARCH API] Architecture: ${process.arch}`);
  console.log(`[${requestId}] [SEARCH API] NODE_ENV: ${process.env.NODE_ENV}`);
  
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const current_page = searchParams.get("current_page") || "1";
  const page_size = searchParams.get("page_size") || "12";
  const sorting_order = searchParams.get("sorting_order") || "REL_DESC";
  const confidence_level = searchParams.get("confidence_level") || "0.25";
  const department = searchParams.get("department") || "";
  const tech_sector_id = searchParams.get("tech_sector_id") || "";
  const assignee_id = searchParams.get("assignee_id") || "";

  console.log(`[${requestId}] [SEARCH API] Request parameters:`, {
    query,
    current_page,
    page_size,
    sorting_order,
    confidence_level,
    department,
    tech_sector_id,
    assignee_id
  });

  try {
    // Build URL parameters only for non-empty values
    // Note: All parameters use snake_case to match backend expectations
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("current_page", current_page);
    params.append("page_size", page_size);
    params.append("sorting_order", sorting_order);
    params.append("confidence_level", confidence_level);
    
    // Only append filter parameters if they have meaningful values
    // Empty strings from joined empty arrays should be treated as "no filter"
    if (department && department !== "") params.append("department", department);
    if (tech_sector_id && tech_sector_id !== "") params.append("tech_sector_id", tech_sector_id);
    if (assignee_id && assignee_id !== "") params.append("assignee_id", assignee_id);

    const fullUrl = `${BACKEND_URLS[ACTIVE_ENV]}/search?${params.toString()}`;
    console.log(`[${requestId}] [SEARCH API] Making request to: ${fullUrl}`);

    const fetchStartTime = Date.now();
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PolyKteoFrontend/1.0'
      },
      // Add timeout for debugging
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const fetchEndTime = Date.now();
    console.log(`[${requestId}] [SEARCH API] Backend response received in ${fetchEndTime - fetchStartTime}ms`);
    console.log(`[${requestId}] [SEARCH API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] [SEARCH API] Backend error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log(`[${requestId}] [SEARCH API] Success! Total time: ${totalTime}ms`);
    console.log(`[${requestId}] [SEARCH API] Response data keys:`, Object.keys(data));
    
    return NextResponse.json(data);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] [SEARCH API] Error after ${totalTime}ms:`, error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error(`[${requestId}] [SEARCH API] Error name: ${error.name}`);
      console.error(`[${requestId}] [SEARCH API] Error message: ${error.message}`);
      console.error(`[${requestId}] [SEARCH API] Error stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch data", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
