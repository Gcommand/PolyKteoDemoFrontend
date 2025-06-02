/**
 * API Client Utility
 * 
 * This utility enforces our backend communication pattern:
 * - All backend calls MUST go through Next.js API routes (/app/api/*)
 * - Direct backend calls are not allowed
 * - Provides type-safe methods for each API endpoint
 */

// API Response Types
export interface ApiResponse<T> {
  results: T[];
  pagination?: {
    current_page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

// API Client Methods
export const apiClient = {
  /**
   * Search patents and technologies
   * Uses the /api/search route which proxies to the backend
   */
  search: async (params: {
    query: string;
    confidence_level?: number;
    sorting_order?: string;
    current_page?: number;
    page_size?: number;
    department?: string;
    tech_sector_id?: string;
    assignee_id?: string;
  }) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      // Use the Next.js API route
      const response = await fetch(`/api/search?${searchParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Search API error: ${response.statusText} - ${errorData.error || ''}`);
      }
      return response.json() as Promise<ApiResponse<any>>;
    } catch (error) {
      console.error('Search API error:', error);
      return {
        results: [],
        pagination: {
          current_page: 1,
          page_size: params.page_size || 12,
          total_count: 0,
          total_pages: 0
        }
      };
    }
  },

  /**
   * Get tech sectors
   * Uses the /api/tech_sectors route which proxies to the backend
   */
  getTechSectors: async () => {
    try {
      // Use the Next.js API route
      const response = await fetch('/api/tech_sectors');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Tech sectors API error: ${response.statusText} - ${errorData.error || ''}`);
      }
      return response.json() as Promise<ApiResponse<{ tech_sector_id: number; tech_sector_name: string; }>>;
    } catch (error) {
      console.error('Tech sectors API error:', error);
      return {
        results: [],
        pagination: {
          current_page: 1,
          page_size: 100,
          total_count: 0,
          total_pages: 0
        }
      };
    }
  },

  /**
   * Get poly assignees
   * Uses the /api/poly_assignees route which proxies to the backend
   */
  getPolyAssignees: async () => {
    try {
      // Use the Next.js API route
      const response = await fetch('/api/poly_assignees');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Poly assignees API error: ${response.statusText} - ${errorData.error || ''}`);
      }
      return response.json() as Promise<ApiResponse<{ assignee_id: number; assignee_name: string; is_poly: boolean; }>>;
    } catch (error) {
      console.error('Poly assignees API error:', error);
      return {
        results: [],
        pagination: {
          current_page: 1,
          page_size: 100,
          total_count: 0,
          total_pages: 0
        }
      };
    }
  }
}; 