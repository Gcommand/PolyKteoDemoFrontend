"use client";
import { Action, queryAtom, searchAtom, confidenceLevelAtom, sortingOrderAtom, moviesAtom, departmentFilterAtom, categoryFilterAtom, assigneeFilterAtom, techSectorsAtom, techSectorsLoadingAtom, polyAssigneesAtom, polyAssigneesLoadingAtom, fetchTechSectorsAtom, fetchPolyAssigneesAtom } from "@/atoms/search-atoms";
import { useAtom, useAtomValue } from "jotai";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MultiSelectDropdown from "./multi-select-dropdown";

/**
 * SearchBar Component
 * 
 * IMPORTANT NOTE ON FILTERS AND SEARCH:
 * When implementing or modifying search/filter functionality, ensure that:
 * 1. All selected filters (especially tech_sector_id) are properly passed during search
 * 2. The selectedCategories array from categoryFilterAtom is joined with commas before passing to searchHandler
 * 3. The same filter format is used consistently across SearchBar and Movies components
 * 
 * Common issues to check:
 * - Verify tech_sector_id parameter is included in the backend call
 * - Ensure selectedCategories is properly joined with commas (selectedCategories.join(','))
 * - Check that both SearchBar and Movies components use the same atom (categoryFilterAtom)
 * - Confirm that the filter state is preserved during search and pagination
 */

// Add Assignee type
type Assignee = {
  assignee_id: number;
  assignee_name: string;
  is_poly: boolean;
};

// Add TechSector type
type TechSector = {
  tech_sector_id: number;
  tech_sector_name: string;
};

const SearchBar = () => {
  const [query, setQuery] = useAtom(queryAtom);
  const [isSearching, searchHandler] = useAtom(searchAtom);
  const [confidenceLevel, setConfidenceLevel] = useAtom(confidenceLevelAtom);
  const [sortingOrder, setSortingOrder] = useAtom(sortingOrderAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const results = useAtomValue(moviesAtom);
  const [selectedDepartment, setSelectedDepartment] = useAtom(departmentFilterAtom);
  const [selectedCategories, setSelectedCategories] = useAtom(categoryFilterAtom);
  const [selectedAssignee, setSelectedAssignee] = useAtom(assigneeFilterAtom);
  
  // Use atoms for tech sectors and poly assignees
  const techSectors = useAtomValue(techSectorsAtom);
  const techSectorsLoading = useAtomValue(techSectorsLoadingAtom);
  const polyAssignees = useAtomValue(polyAssigneesAtom);
  const polyAssigneesLoading = useAtomValue(polyAssigneesLoadingAtom);
  const [, fetchTechSectors] = useAtom(fetchTechSectorsAtom);
  const [, fetchPolyAssignees] = useAtom(fetchPolyAssigneesAtom);
  const router = useRouter();

  // Add error states
  const [fetchError, setFetchError] = useState<{
    techSectors: boolean;
    polyAssignees: boolean;
  }>({
    techSectors: false,
    polyAssignees: false
  });

  // Add a function to check if initial data is still loading
  const isInitialDataLoading = techSectorsLoading || polyAssigneesLoading;

  // Add a function to check if any search-triggering action is disabled
  const isSearchDisabled = isSearching || isInitialDataLoading;

  const keyPressHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategories.join(','), selectedAssignee);
      } else if (e.key === "Escape") {
        setQuery("");
      }
    },
    [searchHandler, setQuery, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategories, selectedAssignee]
  );

  // Keyboard Event Listener
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);
    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [keyPressHandler]);

  // Fetch tech sectors and poly assignees on component mount with better error handling
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        if (mounted) {
          // Reset error states before fetching
          setFetchError({
            techSectors: false,
            polyAssignees: false
          });

          // Fetch both in parallel but handle errors independently
          await Promise.allSettled([
            fetchTechSectors().catch(error => {
              console.error('Failed to fetch tech sectors:', error);
              if (mounted) {
                setFetchError(prev => ({ ...prev, techSectors: true }));
              }
            }),
            fetchPolyAssignees().catch(error => {
              console.error('Failed to fetch poly assignees:', error);
              if (mounted) {
                setFetchError(prev => ({ ...prev, polyAssignees: true }));
              }
            })
          ]);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetchTechSectors, fetchPolyAssignees]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchHandler(Action.SEARCH, sortingOrder, newPage, pageSize, selectedDepartment, selectedCategories.join(','), selectedAssignee);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategories.join(','), selectedAssignee);
    }
  };

  const handleCategoryChange = (values: string[]) => {
    setSelectedCategories(values);
    if (query.length > 0) {
      searchHandler(
        Action.SEARCH, 
        sortingOrder, 
        currentPage, 
        pageSize, 
        selectedDepartment, 
        values.join(','), 
        selectedAssignee
      );
    }
  };

  const handleReset = () => {
    setQuery("");
    setSelectedDepartment("");
    setSelectedCategories([]);
    setSelectedAssignee("");
    searchHandler(Action.RESET);
  };

  return (
    <div className="w-full relative">
      {isInitialDataLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-8 w-8 text-[#a02337]"
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
            <p className="text-gray-700 font-medium">Loading filters...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center w-full gap-1 px-4 border rounded-md group focus-within:border-blue-400 bg-white focus-within:outline-4 focus-within:outline-blue-200 border-gray-300 relative">
          <Search size="16" color="#1e40af" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for..."
            className={`w-full px-4 py-3 bg-transparent rounded-md text-gray-800 group focus:outline-none ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSearchDisabled}
          />
          {isSearching ? (
            <div role="status" className="absolute right-4">
              <svg
                aria-hidden="true"
                className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Searching...</span>
            </div>
          ) : (
            <button
              type="submit"
              onClick={handleSearch}
              disabled={isSearchDisabled}
              className={`absolute right-4 px-4 py-2 bg-[#a02337] text-white rounded-md hover:bg-[#8a1d2e] transition-colors ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Search
            </button>
          )}
        </div>
      </form>

      <div className="w-full mt-2 py-2">
        <div className="flex gap-2 items-center w-full mb-2">
          <div className="flex-1 min-w-0">
            <MultiSelectDropdown
              options={techSectors?.map(ts => ({
                value: ts.tech_sector_id,
                label: ts.tech_sector_name
              })) || []}
              selectedValues={selectedCategories}
              onChange={handleCategoryChange}
              placeholder={
                techSectorsLoading 
                  ? "Loading categories..." 
                  : fetchError.techSectors 
                    ? "Failed to load categories" 
                    : "Select Categories"
              }
              disabled={isSearchDisabled || fetchError.techSectors}
            />
            {fetchError.techSectors && (
              <p className="text-sm text-red-500 mt-1">
                Failed to load categories. Please try refreshing the page.
              </p>
            )}
          </div>
          
          <select
            id="department-select"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              if (query.length > 0) {
                searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, e.target.value, selectedCategories.join(','), selectedAssignee);
              }
            }}
            className={`flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSearchDisabled}
          >
            <option value="">All Departments</option>
            <option value="1">Department of Aeronautical and Aviation Engineering</option>
            <option value="2">Department of Applied Biology and Chemical Technology</option>
            <option value="3">Department of Applied Mathematics</option>
            <option value="4">Department of Applied Physics</option>
            <option value="5">Department of Applied Social Sciences</option>
            <option value="6">Department of Biomedical Engineering</option>
            <option value="7">Department of Building and Real Estate</option>
            <option value="8">Department of Building Environment and Energy Engineering</option>
            <option value="9">Department of Chinese and Bilingual Studies</option>
            <option value="10">Department of Chinese Language and Literature</option>
            <option value="11">Department of Civil and Environmental Engineering</option>
            <option value="12">Department of Computing</option>
            <option value="13">Department of Electrical and Electronic Engineering</option>
            <option value="14">Department of Electronic and Information Engineering</option>
            <option value="15">Department of English</option>
            <option value="16">Department of Fashion and Textiles</option>
            <option value="17">Department of Health Technology and Informatics</option>
            <option value="18">Department of Industrial and Systems Engineering</option>
            <option value="19">Department of Information Technology</option>
            <option value="20">Department of Land Surveying and Geo-Informatics</option>
            <option value="21">Department of Logistics and Maritime Studies</option>
            <option value="22">Department of Management and Marketing</option>
            <option value="23">Department of Mechanical Engineering</option>
            <option value="24">Department of Optometry and Radiography</option>
            <option value="25">Department of Rehabilitation Sciences</option>
            <option value="26">Department of Social Work and Social Administration</option>
            <option value="27">Department of Translational Medicine</option>
          </select>
          
          <select
            id="assignee-select"
            value={selectedAssignee}
            onChange={(e) => {
              setSelectedAssignee(e.target.value);
              if (query.length > 0) {
                searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategories.join(','), e.target.value);
              }
            }}
            className={`flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSearchDisabled || fetchError.polyAssignees}
          >
            <option value="">
              {polyAssigneesLoading 
                ? "Loading assignees..." 
                : fetchError.polyAssignees 
                  ? "Failed to load assignees" 
                  : "All PolyU Assignees"}
            </option>
            {!polyAssigneesLoading && !fetchError.polyAssignees && polyAssignees && polyAssignees.map((a) => (
              <option key={a.assignee_id} value={a.assignee_id}>
                {a.assignee_name === "Hong Kong Polytechnic University HKPU"
                  ? "The Hong Kong Polytechnic University"
                  : a.assignee_name}
              </option>
            ))}
          </select>
          {fetchError.polyAssignees && (
            <p className="text-sm text-red-500 mt-1">
              Failed to load assignees. Please try refreshing the page.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSearchDisabled}
          className={`px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors ${isSearchDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
