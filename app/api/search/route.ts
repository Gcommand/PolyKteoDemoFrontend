import { NextRequest, NextResponse } from "next/server";

// Backend URLs - kept private in route files
const BACKEND_URLS = {
  dev: 'http://localhost:5000',
  staging: 'https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net',
  'gary-testing': 'https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net',
  'gt-docker-4': 'https://gt-docker-4-e8cveaecfhhxb9eq.southeastasia-01.azurewebsites.net'
} as const;

// Change this to switch environments
const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'dev';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";
  const sortingOrder = searchParams.get("sortingOrder") || "REL_DESC";
  const confidenceLevel = searchParams.get("confidenceLevel") || "0.5";
  const departmentNumber = searchParams.get("departmentNumber") || "";
  const techSectorId = searchParams.get("techSectorId") || "";
  const assigneeId = searchParams.get("assigneeId") || "";

  try {
    const response = await fetch(
      `${BACKEND_URLS[ACTIVE_ENV]}/search?query=${encodeURIComponent(
        query
      )}&page=${page}&pageSize=${pageSize}&sortingOrder=${sortingOrder}&confidenceLevel=${confidenceLevel}&departmentNumber=${departmentNumber}&techSectorId=${techSectorId}&assigneeId=${assigneeId}`
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
