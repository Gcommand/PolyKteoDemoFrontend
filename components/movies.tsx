"use client";
import { moviesAtom, paginationAtom, searchAtom, Action, sortingOrderAtom, departmentFilterAtom, categoryFilterAtom, assigneeFilterAtom, isSearchingAtom } from "@/atoms/search-atoms";
import { useAtom, useAtomValue } from "jotai";
import Movie from "./movie";
import { SearchResult } from "@/types/search";
import { useState, useEffect } from "react";

/**
 * Movies Component
 * 
 * IMPORTANT NOTE ON PAGINATION AND FILTERS:
 * When implementing or modifying search/filter functionality, ensure that:
 * 1. All selected filters (especially tech_sector_id) are properly passed during page switching
 * 2. The selectedCategories array from categoryFilterAtom is joined with commas before passing to searchHandler
 * 3. The same filter format is used consistently across SearchBar and Movies components
 * 
 * Common issues to check:
 * - Verify tech_sector_id parameter is included in the backend call when switching pages
 * - Ensure selectedCategories is properly joined with commas (selectedCategories.join(','))
 * - Check that both SearchBar and Movies components use the same atom (categoryFilterAtom)
 * - Confirm that the filter state is preserved during pagination
 */
const Movies = () => {
  const results = useAtomValue(moviesAtom) as unknown as SearchResult[];
  const pagination = useAtomValue(paginationAtom);
  const [, searchHandler] = useAtom(searchAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  const sortingOrder = useAtomValue(sortingOrderAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const selectedDepartment = useAtomValue(departmentFilterAtom);
  const selectedCategories = useAtomValue(categoryFilterAtom);
  const selectedAssignee = useAtomValue(assigneeFilterAtom);
  
  // Reset current page when new results are received
  useEffect(() => {
    setCurrentPage(pagination.current_page);
  }, [pagination.current_page]);
  
  // Remove early return to allow empty state display
  // if (results.length === 0) {
  //   return null;
  // }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchHandler(Action.SEARCH, sortingOrder, newPage, pageSize, selectedDepartment, selectedCategories.join(','), selectedAssignee);
  };

  return (
    <div className="mt-8">
      <div className="border-t border-neutral-700 my-4"></div>
      <h2 className="text-xl font-semibold text-black mb-4">Search Results</h2>
      
      {results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result: SearchResult, index: number) => (
              <Movie key={`${result.title}-${index}`} result={result} />
            ))}
          </div>
          
          {pagination.total_pages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isSearching}
                className={`px-4 py-2 bg-[#a02337] text-white rounded-md transition-colors ${
                  (currentPage === 1 || isSearching) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#8a1d2e]'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {currentPage} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.total_pages || isSearching}
                className={`px-4 py-2 bg-[#a02337] text-white rounded-md transition-colors ${
                  (currentPage === pagination.total_pages || isSearching) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#8a1d2e]'
                }`}
              >
                Next
              </button>
            </div>
          )}

          <div className="text-center mt-4 text-gray-600">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading results...</span>
              </div>
            ) : (
              `Showing ${results.length} of ${pagination.total_count} results`
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
                         Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
          <div className="text-sm text-gray-400">
            • Check your spelling<br/>
            • Try different keywords<br/>
            • Remove some filters to broaden your search
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
