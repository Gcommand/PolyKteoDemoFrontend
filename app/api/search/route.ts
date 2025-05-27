import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const confidenceLevel = searchParams.get("confidence_level") || "0.25";
  const sortingOrder = searchParams.get("sorting_order") || "REL_DESC";
  const currentPage = searchParams.get("current_page") || "1";
  const pageSize = searchParams.get("page_size") || "10";
  const department = searchParams.get("department");
  const techSector = searchParams.get("tech_sector");

  if (!query) {
    return NextResponse.json({ error: "No query provided" });
  }

  // let baseUrl = `http://localhost:5000/search?query=${encodeURIComponent(query)}&confidence_level=${confidenceLevel}&sorting_order=${sortingOrder}&current_page=${currentPage}&page_size=${pageSize}`;
  // let baseUrl = `https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net/search?query=${encodeURIComponent(query)}&confidence_level=${confidenceLevel}&sorting_order=${sortingOrder}&current_page=${currentPage}&page_size=${pageSize}`;
  let baseUrl = `https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net/search?query=${encodeURIComponent(query)}&confidence_level=${confidenceLevel}&sorting_order=${sortingOrder}&current_page=${currentPage}&page_size=${pageSize}`;
  if (department) {
    baseUrl += `&department=${department}`;
  }
  if (techSector) {
    baseUrl += `&tech_sector=${encodeURIComponent(techSector)}`;
  }

  try {
    // Forward the request to the PolyKteo API
    const response = await fetch(
      baseUrl,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from PolyKteo API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from PolyKteo API" },
      { status: 500 }
    );
  }
}
