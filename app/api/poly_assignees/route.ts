import { NextResponse } from "next/server";

export async function GET() {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5000";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://gt-docker-4-e8cveaecfhhxb9eq.southeastasia-01.azurewebsites.net";
  const res = await fetch(`${backendBaseUrl}/poly_assignees`);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch from backend" }, { status: 500 });
  }
  const data = await res.json();
  return NextResponse.json(data);
} 