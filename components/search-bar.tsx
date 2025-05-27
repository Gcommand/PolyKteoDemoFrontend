"use client";
import { Action, queryAtom, searchAtom, confidenceLevelAtom, sortingOrderAtom, moviesAtom } from "@/atoms/search-atoms";
import { useAtom, useAtomValue } from "jotai";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Add Assignee type
type Assignee = {
  assignee_id: number;
  assignee_name: string;
  is_poly: boolean;
};

const SearchBar = () => {
  const [query, setQuery] = useAtom(queryAtom);
  const [isSearching, searchHandler] = useAtom(searchAtom);
  const [confidenceLevel, setConfidenceLevel] = useAtom(confidenceLevelAtom);
  const [sortingOrder, setSortingOrder] = useAtom(sortingOrderAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const results = useAtomValue(moviesAtom);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assigneesLoading, setAssigneesLoading] = useState(true);

  const keyPressHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategory, selectedAssignee);
      } else if (e.key === "Escape") {
        setQuery("");
      }
    },
    [searchHandler, setQuery, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategory, selectedAssignee]
  );

  // Keyboard Event Listener
  useEffect(() => {
    document.addEventListener("keydown", keyPressHandler);
    return () => {
      document.removeEventListener("keydown", keyPressHandler);
    };
  }, [keyPressHandler]);

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5000";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://poly-kteo-poc-d4c9fkgrbaahe5hg.eastasia-01.azurewebsites.net";
  // const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://gary-testing-avh4dya7dygkddhz.southeastasia-01.azurewebsites.net";
  let baseUrl = `${backendBaseUrl}/search?query=...`;

  useEffect(() => {
    setAssigneesLoading(true);
    fetch("/api/poly_assignees")
      .then(res => res.json())
      .then(data => setAssignees(data.results))
      .catch(() => setAssignees([]))
      .finally(() => setAssigneesLoading(false));
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchHandler(Action.SEARCH, sortingOrder, newPage, pageSize, selectedDepartment, selectedCategory, selectedAssignee);
  };

  return (
    <div className="w-full">
      <div className="flex items-center w-full gap-1 px-4 border rounded-md group focus-within:border-blue-400 bg-white focus-within:outline-4 focus-within:outline-blue-200 border-gray-300">
        <Search size="16" color="#1e40af" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for..."
          className="w-full px-4 py-3 bg-transparent rounded-md text-gray-800 group focus:outline-none"
        />
        {isSearching ? (
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
            onClick={() => {
              searchHandler(Action.SEARCH, sortingOrder, 1, pageSize, selectedDepartment, selectedCategory, selectedAssignee);
            }}
            className="search-button inline-block px-3 py-2 text-sm rounded-md transition-colors"
          >
            Search
          </button>
        )}
      </div>

      <div className="w-full mt-2 py-2">
        <div className="flex gap-2 items-center w-full mb-2">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (query.length > 0) {
                searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, e.target.value, selectedAssignee);
              }
            }}
            className="flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Construction">Construction</option>
            <option value="Electrical & Manufacturing">Electrical & Manufacturing</option>
            <option value="Electrical & Manufacturing/Foodtech/Biotech/Pharmaceutical">Electrical & Manufacturing/Foodtech/Biotech/Pharmaceutical</option>
            <option value="Electrical & Manufacturing/Information and Communications Technology">Electrical & Manufacturing/Information and Communications Technology</option>
            <option value="Foodtech/Biotech/Pharmaceutical">Foodtech/Biotech/Pharmaceutical</option>
            <option value="Foodtech/Biotech/Pharmaceutical/Healthcare">Foodtech/Biotech/Pharmaceutical/Healthcare</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Healthcare/Textile">Healthcare/Textile</option>
            <option value="Information and Communications Technology">Information and Communications Technology</option>
            <option value="Material Science">Material Science</option>
            <option value="Other">Other</option>
            <option value="Textile">Textile</option>
          </select>
          <select
            id="department-select"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              if (query.length > 0) {
                searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, e.target.value, selectedCategory, selectedAssignee);
              }
            }}
            className="flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors"
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
            <option value="10">Department of Chinese History and Culture</option>
            <option value="11">Department of Civil and Environmental Engineering</option>
            <option value="12">Department of Computing</option>
            <option value="13">Department of Data Science and Artificial Intelligence</option>
            <option value="14">Department of Electrical and Electronic Engineering</option>
            <option value="15">Department of Electronic and Information Engineering</option>
            <option value="16">Department of English and Communication</option>
            <option value="17">Department of Food Science and Nutrition</option>
            <option value="18">Department of Health Technology and Informatics</option>
            <option value="19">Department of Industrial and Systems Engineering</option>
            <option value="20">Department of Land Surveying and Geo-Informatics</option>
            <option value="21">Department of Logistics and Maritime Studies</option>
            <option value="22">Department of Management and Marketing</option>
            <option value="23">Department of Mechanical Engineering</option>
            <option value="24">Department of Rehabilitation Sciences</option>
            <option value="25">School of Accounting and Finance</option>
            <option value="26">School of Design</option>
            <option value="27">School of Fashion and Textiles</option>
            <option value="28">School of Hotel and Tourism Management</option>
            <option value="29">School of Nursing</option>
            <option value="30">School of Optometry</option>
            <option value="31">Graduate School</option>
            <option value="32">Chinese Language Centre</option>
            <option value="33">Confucius Institute of Hong Kong</option>
            <option value="34">English Language Centre</option>
            <option value="35">Industrial Centre</option>
            <option value="36">Innovation and Technology Development Office</option>
            <option value="37">Research Institute of Innovative Products & Technologies</option>
          </select>
          <select
            id="assignee-select"
            value={selectedAssignee}
            onChange={(e) => {
              setSelectedAssignee(e.target.value);
              if (query.length > 0) {
                searchHandler(Action.SEARCH, sortingOrder, currentPage, pageSize, selectedDepartment, selectedCategory, e.target.value);
              }
            }}
            className="flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors"
            disabled={assigneesLoading}
          >
            <option value="">All PolyU Assignees</option>
            {assignees.map((a) => (
              <option key={a.assignee_id} value={a.assignee_id}>{a.assignee_name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <select
            id="control-sort"
            value={sortingOrder}
            onChange={(e) => {
              setSortingOrder(e.target.value);
              if (results.length > 0) {
                searchHandler(Action.SEARCH, e.target.value, currentPage, pageSize, selectedDepartment, selectedCategory, selectedAssignee);
              }
            }}
            className="flex-1 min-w-0 px-3 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors"
            style={{ maxWidth: '33%' }}
          >
            <option value="REL_DESC">Sort by Relevance: Descending</option>
            <option value="REL_ASC">Sort by Relevance: Ascending</option>
            <option value="FSD_ASC">Sort by Faculties, Schools & Departments: A-Z</option>
            <option value="FSD_DESC">Sort by Faculties, Schools & Departments: Z-A</option>
            <option value="DATE_DESC">Sort by Latest date: Latest</option>
            <option value="DATE_ASC">Sort by Latest date: Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
