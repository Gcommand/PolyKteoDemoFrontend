"use client";

import Movies from "@/components/movies";
import SearchBar from "@/components/search-bar";
import { useAtomValue } from "jotai";
import { moviesAtom, sortingOrderAtom, searchAtom, departmentFilterAtom, categoryFilterAtom, assigneeFilterAtom } from "@/atoms/search-atoms";
import { useAtom } from "jotai";
import { Action } from "@/atoms/search-atoms";
import { techSectorsLoadingAtom, polyAssigneesLoadingAtom, isSearchingAtom } from "@/atoms/search-atoms";
import { useEffect, useState } from "react";

export default function Home() {
  const results = useAtomValue(moviesAtom);
  const [sortingOrder, setSortingOrder] = useAtom(sortingOrderAtom);
  const [, searchHandler] = useAtom(searchAtom);
  const techSectorsLoading = useAtomValue(techSectorsLoadingAtom);
  const polyAssigneesLoading = useAtomValue(polyAssigneesLoadingAtom);
  const isSearching = useAtomValue(isSearchingAtom);
  
  // Get current filter values
  const selectedDepartment = useAtomValue(departmentFilterAtom);
  const selectedCategories = useAtomValue(categoryFilterAtom);
  const selectedAssignee = useAtomValue(assigneeFilterAtom);

  // Add state to track if initial load has been attempted
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  const isSearchDisabled = isSearching || techSectorsLoading || polyAssigneesLoading;

  // Load initial data when page mounts for browse-all functionality
  useEffect(() => {
    // Only load if we haven't attempted initial load yet and filters are loaded
    if (!initialLoadAttempted && !techSectorsLoading && !polyAssigneesLoading && !isSearching) {
      // Perform an empty search to load initial data with latest date sorting
      searchHandler(Action.SEARCH, "DATE_DESC", 1, 12, [], [], []);
      setInitialLoadAttempted(true);
    }
  }, [initialLoadAttempted, techSectorsLoading, polyAssigneesLoading, isSearching, searchHandler]);

  return (
    <main>
      {/* Main Content Container */}
      <div className="main-content">
        <div className="mt-6 mb-8">
          <h2 className="page-title">Find Patents & Technologies</h2>
          <p className="page-subtitle">
            Search patents and technologies by keyword, or browse all available content using the filters below.
          </p>
        </div>
        
        <div className="search-container p-4 bg-white rounded-md shadow-sm">
          <SearchBar />
        </div>
        
        {/* Results List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#a02337]">Patents & Technologies</h3>
            {results.length > 0 && (
              <select
                id="control-sort"
                value={sortingOrder}
                onChange={(e) => {
                  setSortingOrder(e.target.value);
                  searchHandler(
                    Action.SEARCH, 
                    e.target.value, 
                    1, // currentPage
                    12, // pageSize
                    selectedDepartment.join(','),
                    selectedCategories.join(','),
                    selectedAssignee.join(',')
                  );
                }}
                className={`px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSearchDisabled}
              >
                <option value="REL_DESC">Sort by Relevance: Descending</option>
                <option value="REL_ASC">Sort by Relevance: Ascending</option>
                <option value="FSD_ASC">Sort by Faculties, Schools & Departments: A-Z</option>
                <option value="FSD_DESC">Sort by Faculties, Schools & Departments: Z-A</option>
                <option value="DATE_DESC">Sort by Latest date: Latest</option>
                <option value="DATE_ASC">Sort by Latest date: Oldest</option>
              </select>
            )}
          </div>
          <Movies />
        </div>
      </div>
    </main>
  );
}
