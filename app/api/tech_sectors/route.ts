import { NextResponse } from 'next/server';

// const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net";
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://gt-docker-4-e8cveaecfhhxb9eq.southeastasia-01.azurewebsites.net";
export async function GET() {
  try {
    const response = await fetch(`${backendBaseUrl}/tech_sectors`);
    if (!response.ok) {
      throw new Error('Failed to fetch tech sectors');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tech sectors:', error);
    return NextResponse.json({ error: 'Failed to fetch tech sectors' }, { status: 500 });
  }
} 