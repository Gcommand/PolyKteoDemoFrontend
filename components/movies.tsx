"use client";
import { moviesAtom, paginationAtom, searchAtom, Action, sortingOrderAtom } from "@/atoms/search-atoms";
import { useAtom, useAtomValue } from "jotai";
import Movie from "./movie";
import { SearchResult } from "@/types/search";
import { useState, useEffect } from "react";

const Movies = () => {
  const results = useAtomValue(moviesAtom) as unknown as SearchResult[];
  const pagination = useAtomValue(paginationAtom);
  const [, searchHandler] = useAtom(searchAtom);
  const sortingOrder = useAtomValue(sortingOrderAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Reset current page when new results are received
  useEffect(() => {
    setCurrentPage(pagination.current_page);
  }, [pagination.current_page]);
  
  if (results.length === 0) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchHandler(Action.SEARCH, sortingOrder, newPage, pageSize);
  };

  return (
    <div className="mt-8">
      <div className="border-t border-neutral-700 my-4"></div>
      <h2 className="text-xl font-semibold text-neutral-50 mb-4">Search Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result: SearchResult, index: number) => (
          <Movie key={`${result.title}-${index}`} result={result} />
        ))}
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-10">
          <p className="text-neutral-400">No results found for your search query.</p>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#a02337] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8a1d2e] transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Page</span>
            <span className="font-medium">{currentPage}</span>
            <span className="text-gray-600">of</span>
            <span className="font-medium">{pagination.total_pages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.total_pages}
            className="px-4 py-2 bg-[#a02337] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8a1d2e] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <div className="text-center mt-4 text-gray-600">
        Showing {results.length} of {pagination.total_count} results
      </div>
    </div>
  );
};

export default Movies;
