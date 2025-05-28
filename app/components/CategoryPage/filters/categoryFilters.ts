// Legacy file - filter functions have been moved to individual files in the filters/ directory
// This file now only contains shared interfaces for backwards compatibility

export interface FilterOption {
  id: string;
  name: string;
}

export interface FilterGroup {
  title: string;
  type: string;
  options: FilterOption[];
}

// Note: Individual filter functions have been moved to:
// - mouseFilters.ts
// - headphonesFilters.ts
// - monitorFilters.ts
// - microphoneFilters.ts
// - cameraFilters.ts
// - speakerFilters.ts
// - mousePadFilters.ts
// - keyboardFilters.ts
// And other component-specific filter files in the filters/ directory
