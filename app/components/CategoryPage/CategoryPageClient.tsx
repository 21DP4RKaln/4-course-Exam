"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import type { Component } from '@prisma/client';

// Define custom interfaces
interface Specification {
  id: string;
  name: string;
  displayName: string;
  values: string[];
}

interface FilterGroup {
  type: string;
  displayName: string;
  values: string[];
}

export default function CategoryPageClient({ 
  initialComponents,
  initialSpecifications,
  categorySlug,
  type = 'component'
}: {
  initialComponents: Component[];
  initialSpecifications: Specification[];
  categorySlug: string;
  type?: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>(initialComponents);
  const [specifications, setSpecifications] = useState<Specification[]>(initialSpecifications);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [sortOption, setSortOption] = useState('price-asc');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  useEffect(() => {
    const apiEndpoint = type === 'peripheral' ? 
      `/api/components?category=${categorySlug}&type=peripherals` : 
      `/api/components?category=${categorySlug}&type=components`;

    const fetchComponentsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
          throw new Error(t('categoryPage.fetchError', { type }));
        }
        
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          const category = data.categories.find((cat: any) => cat.slug === categorySlug);
          if (category) {
            setCategoryName(category.name);
          } else {
            setCategoryName(data.categories[0].name);
          }
        }
        
        if (data.components && Array.isArray(data.components)) {
          setComponents(data.components);
          setFilteredComponents(data.components);
        }
        
        if (data.specifications && Array.isArray(data.specifications)) {
          setSpecifications(data.specifications);
          
          const initialExpandedSections: Record<string, boolean> = {};
          
          const groups = organizeFiltersIntoGroups(data.specifications);
          setFilterGroups(groups);
          
          groups.slice(0, 3).forEach(group => {
            initialExpandedSections[group.type] = true;
          });
          
          setExpandedSections(initialExpandedSections);
          
          const initialSelectedFilters: Record<string, string[]> = {};
          groups.forEach(group => {
            initialSelectedFilters[group.type] = [];
          });
          setSelectedFilters(initialSelectedFilters);
        }
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err);
        setError(t('categoryPage.fetchError', { type }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchComponentsData();
  }, [categorySlug, type, t]);

  const organizeFiltersIntoGroups = (specs: Specification[]): FilterGroup[] => {
    // Kopējam esošo organizeFiltersIntoGroups funkcijas implementāciju
    // ...existing code...
    return [];
  };

  return (
    <div>
      {/* Pārvietojiet UI komponentes no CategoryPage šeit */}
    </div>
  );
}
