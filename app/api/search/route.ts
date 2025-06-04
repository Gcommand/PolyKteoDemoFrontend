import { NextRequest, NextResponse } from "next/server";

// Backend URLs - kept private in route files
const BACKEND_URLS = {
  dev: 'http://localhost:5000',
  staging: 'https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net',
  'gary-testing': 'https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net',
  'gt-docker-4': 'https://gt-docker-4-e8cveaecfhhxb9eq.southeastasia-01.azurewebsites.net'
} as const;

// Change this to switch environments
// const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'dev';
const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'gary-testing';

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
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const current_page = searchParams.get("current_page") || "1";
  const page_size = searchParams.get("page_size") || "12";
  const sorting_order = searchParams.get("sorting_order") || "REL_DESC";
  const confidence_level = searchParams.get("confidence_level") || "0.25";
  const department = searchParams.get("department") || "";
  const tech_sector_id = searchParams.get("tech_sector_id") || "";
  const assignee_id = searchParams.get("assignee_id") || "";

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

    const response = await fetch(
      `${BACKEND_URLS[ACTIVE_ENV]}/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
