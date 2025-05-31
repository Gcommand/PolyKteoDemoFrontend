export interface DepartmentInfo {
  department_id: number;
  department_name: string;
  abbreviation: string;
}

export interface SearchResult {
  sys_id: string;
  title: string;
  official_title?: string;
  inventor?: string;
  departments?: Array<{
    abbreviation: string;
    name: string;
  }>;
  tech_sector_id?: number;
  is_tech: boolean;
  country_region?: string;
  google_patent_link?: string;
  similarity?: number;
  ai_summary?: string;
  ai_short_summary?: string;
  query?: string;
}
