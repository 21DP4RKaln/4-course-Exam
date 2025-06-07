'use client';

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
  title: string;
  type: string;
  options: {
    id: string;
    name: string;
  }[];
}

export default function CategoryPageClient({
  initialComponents,
  initialSpecifications,
  categorySlug,
  type = 'component',
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
  const [filteredComponents, setFilteredComponents] =
    useState<Component[]>(initialComponents);
  const [specifications, setSpecifications] = useState<Specification[]>(
    initialSpecifications
  );
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [sortOption, setSortOption] = useState('price-asc');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  useEffect(() => {
    const apiEndpoint =
      type === 'peripheral'
        ? `/api/components?category=${categorySlug}&type=peripherals`
        : `/api/components?category=${categorySlug}&type=components`;

    const fetchComponentsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(t('categoryPage.fetchError', { type }));
        }

        const data = await response.json();

        if (data.categories && data.categories.length > 0) {
          const category = data.categories.find(
            (cat: any) => cat.slug === categorySlug
          );
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
    // Define common filter types
    const filterTypes = {
      manufacturer: ['brand', 'manufacturer', 'make'],
      performance: ['clock', 'speed', 'frequency', 'power', 'tdp'],
      memory: ['memory', 'ram', 'capacity', 'storage'],
      display: ['resolution', 'refresh', 'panel', 'size'],
      connectivity: ['port', 'interface', 'connection', 'wireless'],
      physical: ['dimension', 'size', 'weight', 'material'],
      features: ['rgb', 'lighting', 'fan', 'cooling'],
    };

    // Initialize filter groups
    const groupMap: Record<string, FilterGroup> = {};

    // Process specifications
    specs.forEach(spec => {
      if (!spec?.values?.length) return;

      const name = spec.name.toLowerCase();
      const displayName = spec.displayName || spec.name;

      // Determine group type
      let groupType = 'other';
      let groupTitle = displayName;

      // Check for manufacturer/brand first
      if (filterTypes.manufacturer.some(term => name.includes(term))) {
        groupType = 'manufacturer';
        groupTitle = t('categoryPage.filterGroups.manufacturer');
      }
      // Then check other filter types
      else {
        for (const [type, terms] of Object.entries(filterTypes)) {
          if (terms.some(term => name.includes(term))) {
            groupType = type;
            groupTitle = t(`categoryPage.filterGroups.${type}`);
            break;
          }
        }
      }

      // Get or create group
      if (!groupMap[groupType]) {
        groupMap[groupType] = {
          title: groupTitle,
          type: groupType,
          options: [],
        };
      }

      // Add options to group
      spec.values
        .filter(value => value && String(value).trim())
        .forEach(value => {
          const option = {
            id: `${spec.name}=${value}`,
            name: String(value).trim(),
          };

          // Check for duplicate before adding
          if (!groupMap[groupType].options.some(o => o.id === option.id)) {
            groupMap[groupType].options.push(option);
          }
        });
    });

    // Sort groups and their options
    const groups = Object.values(groupMap)
      .filter(g => g.options.length > 0)
      .sort((a, b) => {
        // Put manufacturer first
        if (a.type === 'manufacturer') return -1;
        if (b.type === 'manufacturer') return 1;
        return a.title.localeCompare(b.title);
      });

    // Sort options within each group
    groups.forEach(group => {
      group.options.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  };

  return <div>{/* Pārvietojiet UI komponentes no CategoryPage šeit */}</div>;
}
