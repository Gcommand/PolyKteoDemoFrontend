import { atom } from "jotai";
import { apiClient } from "@/utils/api-client";

/**
 * Architecture Note:
 * All backend communication should be done through Next.js API routes (/app/api/*) instead of direct backend calls.
 * This pattern provides several benefits:
 * 1. Centralizes backend URL configuration
 * 2. Adds a security layer by not exposing backend URLs to the client
 * 3. Allows for request/response transformation in one place
 * 4. Makes it easier to handle errors and add middleware
 * 
 * Example API route structure:
 * /app/api/search/route.ts - Handles search requests
 * /app/api/tech_sectors/route.ts - Handles tech sectors data
 * /app/api/poly_assignees/route.ts - Handles poly assignees data
 */

export enum Action {
  SEARCH = "SEARCH",
  RESET = "RESET",
}

interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface DepartmentInfo {
  department_id: number;
  department_name: string;
  abbreviation: string;
}

export interface SearchResult {
  title: string;
  description: string;
  official_title: string;
  sys_id: string;
  query: string;
  ai_summary: string;
  ai_short_summary: string;
  country_region: string;
  department: string;
  google_patent_link: string;
  inventor: string;
  similarity: number;
  tech_sector_id: number;
  is_tech: boolean;
  is_cn_applied: boolean;
  departments?: DepartmentInfo[];
  tech_sectors?: Array<{
    tech_sector_id: number;
    tech_sector_name: string;
  }>;
}

/**
 * Search Handler Function
 * Note: This function uses our local API routes instead of calling the backend directly.
 * The actual backend communication is handled in the corresponding route.ts files.
 */
const searchHandler = async (
  query: string,
  confidenceLevel: number = 0.25,
  sortingOrder: string = "REL_DESC",
  currentPage: number = 1,
  pageSize: number = 12,
  departmentNumber?: string,
  techSectorId?: string,
  assigneeId?: string
) => {
  try {
    const responseData = await apiClient.search({
      query,
      confidence_level: confidenceLevel,
      sorting_order: sortingOrder,
      current_page: currentPage,
      page_size: pageSize,
      department: departmentNumber,
      tech_sector_id: techSectorId,
      assignee_id: assigneeId
    });
    
    // Transform the data to match the expected SearchResult format
    const transformedResults = responseData.results.map((item: any) => ({
      title: item.official_title || '',
      description: `Inventor: ${item.inventor || 'Unknown'} | Department: ${item.departments && item.departments.length > 0 ? item.departments.map((d: any) => d.abbreviation).join(', ') : 'N/A'} | Tech Sector: ${item.tech_sectors && item.tech_sectors.length > 0 ? item.tech_sectors.map((ts: any) => ts.tech_sector_name).join(', ') : 'N/A'}`,
      official_title: item.official_title || '',
      sys_id: item.sys_id,
      query: query,
      ai_summary: item.ai_summary || '',
      ai_short_summary: item.ai_short_summary || '',
      country_region: item.country_region || '',
      department: item.department || '',
      departments: item.departments || [],
      google_patent_link: item.google_patent_link || '',
      inventor: item.inventor || '',
      similarity: item.similarity || 0,
      tech_sector_id: item.tech_sectors && item.tech_sectors.length > 0 ? item.tech_sectors[0].tech_sector_id : undefined,
      is_tech: item.is_tech || false,
      is_cn_applied: item.is_cn_applied || false,
      tech_sectors: item.tech_sectors || []
    }));

    return {
      results: transformedResults,
      pagination: responseData.pagination
    };
  } catch (error) {
    console.error("Error fetching search results:", error);
    return {
      results: [],
      pagination: {
        current_page: 1,
        page_size: pageSize,
        total_count: 0,
        total_pages: 0
      }
    };
  }
};

const searchActiveAtom = atom(false);

export const queryAtom = atom("", (_get, set, query) => {
  if (query === "") {
    set(searchAtom, Action.RESET);
  }
  set(queryAtom, query);
});

// Add a new atom to store the confidence level with a default value of 0.25
export const confidenceLevelAtom = atom<number>(0.25);

// Add sorting order atom
export const sortingOrderAtom = atom<string>("REL_DESC");

// Add pagination atom
export const paginationAtom = atom<PaginationInfo>({
  current_page: 1,
  page_size: 12,
  total_count: 0,
  total_pages: 0
});

export const isSearchingAtom = atom(false);

export const searchAtom = atom(
  null,
  async (get, set, action: Action, sortingOrder?: string, currentPage?: number, pageSize?: number, departmentNumber?: string | string[], techSectorId?: string | string[], assigneeId?: string | string[]) => {
    set(isSearchingAtom, true);
    try {
      const query = get(queryAtom);
      const confidenceLevel = get(confidenceLevelAtom);
      
      if (action === Action.SEARCH && query.length > 0) {
        set(searchActiveAtom, true);
        const { results, pagination } = await searchHandler(
          query,
          confidenceLevel,
          sortingOrder,
          currentPage,
          pageSize,
          Array.isArray(departmentNumber) ? departmentNumber.join(',') : departmentNumber,
          Array.isArray(techSectorId) ? techSectorId.join(',') : techSectorId,
          Array.isArray(assigneeId) ? assigneeId.join(',') : assigneeId
        );
        set(moviesAtom, results);
        set(paginationAtom, pagination || {
          current_page: 1,
          page_size: pageSize || 12,
          total_count: 0,
          total_pages: 0
        });
      } else if (action === Action.RESET) {
        set(searchActiveAtom, false);
        set(moviesAtom, []);
        set(paginationAtom, {
          current_page: 1,
          page_size: 12,
          total_count: 0,
          total_pages: 0
        });
      }
    } finally {
      set(isSearchingAtom, false);
      set(searchActiveAtom, false);
    }
  }
);

// Initialize with an empty array of SearchResult
export const moviesAtom = atom<SearchResult[]>([]);

// Add filter atoms
export const departmentFilterAtom = atom<string[]>([]);
export const categoryFilterAtom = atom<string[]>([]);
export const assigneeFilterAtom = atom<string[]>([]);

// Add atoms for tech sectors and poly assignees
export const techSectorsAtom = atom<Array<{ tech_sector_id: number; tech_sector_name: string; }>>([]);
export const techSectorsLoadingAtom = atom<boolean>(true);

export const polyAssigneesAtom = atom<Array<{ assignee_id: number; assignee_name: string; is_poly: boolean; }>>([]);
export const polyAssigneesLoadingAtom = atom<boolean>(true);

/**
 * Data Fetching Functions with Retry Logic
 * These functions use our local API routes to fetch data from the backend.
 * The actual backend communication is handled in the corresponding route.ts files.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY
): Promise<T> => {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries === 0) {
      console.error('Max retries reached:', error);
      throw error;
    }
    console.warn(`Retrying... ${retries} attempts remaining`);
    await delay(delayMs);
    return fetchWithRetry(fetchFn, retries - 1, delayMs * 1.5); // Exponential backoff
  }
};

const fetchTechSectors = async () => {
  try {
    const data = await fetchWithRetry(() => apiClient.getTechSectors());
    return data.results;
  } catch (error) {
    console.error('Error fetching tech sectors after retries:', error);
    return [];
  }
};

const fetchPolyAssignees = async () => {
  try {
    const data = await fetchWithRetry(() => apiClient.getPolyAssignees());
    return data.results;
  } catch (error) {
    console.error('Error fetching poly assignees after retries:', error);
    return [];
  }
};

// Add atoms for fetching tech sectors and poly assignees with better error handling
export const fetchTechSectorsAtom = atom(
  null,
  async (get, set) => {
    try {
      set(techSectorsLoadingAtom, true);
      const techSectors = await fetchTechSectors();
      set(techSectorsAtom, techSectors);
    } catch (error) {
      console.error('Failed to fetch tech sectors:', error);
      set(techSectorsAtom, []); // Set empty array on error
    } finally {
      set(techSectorsLoadingAtom, false);
    }
  }
);

export const fetchPolyAssigneesAtom = atom(
  null,
  async (get, set) => {
    try {
      set(polyAssigneesLoadingAtom, true);
      const polyAssignees = await fetchPolyAssignees();
      set(polyAssigneesAtom, polyAssignees);
    } catch (error) {
      console.error('Failed to fetch poly assignees:', error);
      set(polyAssigneesAtom, []); // Set empty array on error
    } finally {
      set(polyAssigneesLoadingAtom, false);
    }
  }
);
