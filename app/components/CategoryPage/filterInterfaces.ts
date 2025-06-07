export interface FilterOption {
  id: string;
  name: string;
  translationKey?: string;
}

export interface FilterGroup {
  title: string;
  type: string;
  options: FilterOption[];
  titleTranslationKey?: string;
}
export interface FilterState {
  searchQuery: string;
  selectedFilters: Record<string, string[]>;
  sortOption: string;
  expandedSections: Record<string, boolean>;
}
