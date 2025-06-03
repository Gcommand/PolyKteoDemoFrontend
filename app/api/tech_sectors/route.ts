import { NextResponse } from 'next/server';

// Backend URLs - kept private in route files
const BACKEND_URLS = {
  dev: 'http://localhost:5000',
  staging: 'https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net',
  'gary-testing': 'https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net',
  'gt-docker-4': 'https://gt-docker-4-e8cveaecfhhxb9eq.southeastasia-01.azurewebsites.net'
} as const;

// Change this to switch environments
const ACTIVE_ENV: keyof typeof BACKEND_URLS = 'dev';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URLS[ACTIVE_ENV]}/tech_sectors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tech sectors:', error);
    return NextResponse.json({ error: 'Failed to fetch tech sectors' }, { status: 500 });
  }
} 