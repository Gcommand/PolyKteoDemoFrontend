/**
 * Frontend API Configuration
 * 
 * This file centralizes all frontend API route configurations.
 * The actual backend URLs are kept private in the corresponding route.ts files.
 */

// Common endpoints for frontend API routes
export const ENDPOINTS = {
  search: '/api/search',
  techSectors: '/api/tech_sectors',
  polyAssignees: '/api/poly_assignees',
} as const;

// Helper function to get the full URL for a frontend API endpoint
export const getApiUrl = (endpoint: string): string => {
  return endpoint;
};

// Export full URLs for each frontend API endpoint
export const API_URLS = {
  search: getApiUrl(ENDPOINTS.search),
  techSectors: getApiUrl(ENDPOINTS.techSectors),
  polyAssignees: getApiUrl(ENDPOINTS.polyAssignees),
} as const; 