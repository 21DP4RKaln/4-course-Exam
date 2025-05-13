'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Filter, Search, X, ChevronDown } from 'lucide-react'

interface RangeFilter {
  min: number
  max: number
  step?: number
  unit?: string
}

interface FilterOption {
  id: string
  name: string
}

interface FilterGroup {
  title: string
  type: 'range' | 'checkbox' | 'radio'
  options?: FilterOption[]
  range?: RangeFilter
}

interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, any>) => void
  onSearchChange: (query: string) => void
  activeCategory: string
  filterGroups?: FilterGroup[]
}

export default function AdvancedFilter({
  onFilterChange,
  onSearchChange,
  activeCategory,
  filterGroups
}: AdvancedFilterProps) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({})

  const getFilterGroupsByCategory = (): FilterGroup[] => {
    const baseFilters: FilterGroup[] = [
      {
        title: t('configurator.filters.price'),
        type: 'range',
        range: {
          min: 0,
          max: 5000,
          step: 10,
          unit: '€'
        }
      }
    ]

    switch (activeCategory) {
      case 'cpu':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'radio',
            options: [
              { id: 'intel', name: 'Intel' },
              { id: 'amd', name: 'AMD' }
            ]
          },
          {
            title: t('configurator.filters.cores'),
            type: 'range',
            range: {
              min: 2,
              max: 32,
              step: 2
            }
          },
          {
            title: t('configurator.filters.threads'),
            type: 'checkbox',
            options: [
              { id: 'multi-threaded', name: 'Multi-threaded' }
            ]
          },
          {
            title: t('configurator.filters.socket'),
            type: 'checkbox',
            options: [
              { id: 'lga1700', name: 'LGA 1700' },
              { id: 'am5', name: 'AM5' },
              { id: 'am4', name: 'AM4' }
            ]
          },
          {
            title: t('configurator.filters.frequency'),
            type: 'range',
            range: {
              min: 2,
              max: 6,
              step: 0.1,
              unit: 'GHz'
            }
          },
          {
            title: t('configurator.filters.maxRam'),
            type: 'range',
            range: {
              min: 32,
              max: 256,
              step: 32,
              unit: 'GB'
            }
          },
          {
            title: t('configurator.filters.ramFrequency'),
            type: 'range',
            range: {
              min: 2400,
              max: 6000,
              step: 100,
              unit: 'MHz'
            }
          },
          {
            title: t('configurator.filters.techProcess'),
            type: 'checkbox',
            options: [
              { id: '5nm', name: '5nm' },
              { id: '7nm', name: '7nm' },
              { id: '10nm', name: '10nm' }
            ]
          }
        ]

      case 'gpu':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'radio',
            options: [
              { id: 'nvidia', name: 'NVIDIA' },
              { id: 'amd', name: 'AMD' }
            ]
          },
          {
            title: t('configurator.filters.vram'),
            type: 'range',
            range: {
              min: 4,
              max: 24,
              step: 2,
              unit: 'GB'
            }
          },
          {
            title: t('configurator.filters.cooling'),
            type: 'checkbox',
            options: [
              { id: 'triple-fan', name: '3 Fans' },
              { id: 'dual-fan', name: '2 Fans' },
              { id: 'single-fan', name: '1 Fan' }
            ]
          }
        ]

      case 'ram':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'corsair', name: 'Corsair' },
              { id: 'gskill', name: 'G.Skill' },
              { id: 'kingston', name: 'Kingston' },
              { id: 'crucial', name: 'Crucial' }
            ]
          },
          {
            title: t('configurator.filters.frequency'),
            type: 'range',
            range: {
              min: 2400,
              max: 6000,
              step: 100,
              unit: 'MHz'
            }
          },
          {
            title: t('configurator.filters.rgb'),
            type: 'checkbox',
            options: [
              { id: 'rgb', name: 'RGB Lighting' }
            ]
          }
        ]

      case 'motherboard':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'asus', name: 'ASUS' },
              { id: 'msi', name: 'MSI' },
              { id: 'gigabyte', name: 'Gigabyte' },
              { id: 'asrock', name: 'ASRock' }
            ]
          },
          {
            title: t('configurator.filters.socket'),
            type: 'checkbox',
            options: [
              { id: 'lga1700', name: 'LGA 1700' },
              { id: 'am5', name: 'AM5' },
              { id: 'am4', name: 'AM4' }
            ]
          },
          {
            title: t('configurator.filters.memorySlots'),
            type: 'range',
            range: {
              min: 2,
              max: 8,
              step: 2
            }
          },
          {
            title: t('configurator.filters.cpuSupport'),
            type: 'radio',
            options: [
              { id: 'intel', name: 'Intel' },
              { id: 'amd', name: 'AMD' }
            ]
          },
          {
            title: t('configurator.filters.memoryType'),
            type: 'checkbox',
            options: [
              { id: 'ddr5', name: 'DDR5' },
              { id: 'ddr4', name: 'DDR4' }
            ]
          },
          {
            title: t('configurator.filters.maxRam'),
            type: 'range',
            range: {
              min: 32,
              max: 256,
              step: 32,
              unit: 'GB'
            }
          },
          {
            title: t('configurator.filters.ramFrequency'),
            type: 'range',
            range: {
              min: 2400,
              max: 6000,
              step: 100,
              unit: 'MHz'
            }
          },
          {
            title: t('configurator.filters.gpuSlots'),
            type: 'range',
            range: {
              min: 1,
              max: 4,
              step: 1
            }
          },
          {
            title: t('configurator.filters.sataPorts'),
            type: 'range',
            range: {
              min: 2,
              max: 8,
              step: 1
            }
          },
          {
            title: t('configurator.filters.m2Slots'),
            type: 'range',
            range: {
              min: 1,
              max: 4,
              step: 1
            }
          },
          {
            title: t('configurator.filters.features'),
            type: 'checkbox',
            options: [
              { id: 'sli-crossfire', name: 'SLI/CrossFire' },
              { id: 'wifi-bt', name: 'Wi-Fi + Bluetooth' },
              { id: 'nvme', name: 'NVMe Support' }
            ]
          },
          {
            title: t('configurator.filters.format'),
            type: 'radio',
            options: [
              { id: 'atx', name: 'ATX' },
              { id: 'micro-atx', name: 'Micro-ATX' },
              { id: 'mini-itx', name: 'Mini-ITX' }
            ]
          }
        ]

      case 'storage':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'samsung', name: 'Samsung' },
              { id: 'crucial', name: 'Crucial' },
              { id: 'western-digital', name: 'Western Digital' },
              { id: 'seagate', name: 'Seagate' }
            ]
          },
          {
            title: t('configurator.filters.capacity'),
            type: 'range',
            range: {
              min: 250,
              max: 4000,
              step: 250,
              unit: 'GB'
            }
          },
          {
            title: t('configurator.filters.nvme'),
            type: 'checkbox',
            options: [
              { id: 'nvme', name: 'NVMe Drive' }
            ]
          }
        ]

      case 'cooling':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'noctua', name: 'Noctua' },
              { id: 'corsair', name: 'Corsair' },
              { id: 'be-quiet', name: 'be quiet!' },
              { id: 'cooler-master', name: 'Cooler Master' }
            ]
          },
          {
            title: t('configurator.filters.tdp'),
            type: 'range',
            range: {
              min: 65,
              max: 360,
              step: 5,
              unit: 'W'
            }
          },
          {
            title: t('configurator.filters.heatpipes'),
            type: 'range',
            range: {
              min: 2,
              max: 8,
              step: 1
            }
          }
        ]

      case 'psu':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'corsair', name: 'Corsair' },
              { id: 'seasonic', name: 'Seasonic' },
              { id: 'evga', name: 'EVGA' },
              { id: 'be-quiet', name: 'be quiet!' }
            ]
          },
          {
            title: t('configurator.filters.wattage'),
            type: 'range',
            range: {
              min: 450,
              max: 1600,
              step: 50,
              unit: 'W'
            }
          }
        ]

      case 'case':
        return [
          ...baseFilters,
          {
            title: t('configurator.filters.manufacturer'),
            type: 'checkbox',
            options: [
              { id: 'lian-li', name: 'Lian Li' },
              { id: 'phanteks', name: 'Phanteks' },
              { id: 'fractal', name: 'Fractal Design' },
              { id: 'corsair', name: 'Corsair' }
            ]
          },
          {
            title: t('configurator.filters.watercooling'),
            type: 'checkbox',
            options: [
              { id: 'water-cooling', name: 'Water Cooling Support' }
            ]
          }
        ]

      case 'additional-services':
        return [
          {
            title: t('configurator.filters.services'),
            type: 'checkbox',
            options: [
              { id: 'assembly', name: 'PC Assembly' },
              { id: 'warranty', name: 'Extended Warranty' },
              { id: 'overclocking', name: 'Overclocking Setup' },
              { id: 'windows', name: 'Windows Installation' }
            ]
          }
        ]

      default:
        return baseFilters
    }
  }

  useEffect(() => {
    setSelectedFilters({})
    setSearchQuery('')
  }, [activeCategory])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, onSearchChange])

  const handleFilterChange = (groupTitle: string, value: any) => {
    setSelectedFilters(prev => {
      const newFilters = {
        ...prev,
        [groupTitle]: value
      }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'range':
        if (!group.range) return null
        const currentRange = selectedFilters[group.title] || { min: group.range.min, max: group.range.max }
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentRange.min}{group.range.unit}</span>
              <span>{currentRange.max}{group.range.unit}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min={group.range.min}
                max={group.range.max}
                step={group.range.step}
                value={currentRange.min}
                onChange={(e) => handleFilterChange(group.title, {
                  ...currentRange,
                  min: Number(e.target.value)
                })}
                className="w-full"
              />
              <input
                type="range"
                min={group.range.min}
                max={group.range.max}
                step={group.range.step}
                value={currentRange.max}
                onChange={(e) => handleFilterChange(group.title, {
                  ...currentRange,
                  max: Number(e.target.value)
                })}
                className="w-full"
              />
            </div>
          </div>
        )

      case 'checkbox':
      case 'radio':
        if (!group.options) return null
        const selectedValues = selectedFilters[group.title] || []
        return (
          <div className="space-y-1">
            {group.options.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type={group.type}
                  checked={group.type === 'radio' 
                    ? selectedValues === option.id 
                    : selectedValues.includes(option.id)}
                  onChange={() => {
                    if (group.type === 'radio') {
                      handleFilterChange(group.title, option.id)
                    } else {
                      const newValues: string[] = selectedValues.includes(option.id)
                        ? selectedValues.filter((id: string) => id !== option.id)
                        : [...selectedValues, option.id]
                      handleFilterChange(group.title, newValues)
                    }
                  }}
                  className={group.type === 'radio' ? 'form-radio' : 'form-checkbox'}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.name}</span>
              </label>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="bg-white dark:bg-stone-950 rounded-lg shadow-sm p-4">
      {/* Search bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('configurator.search')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="space-y-4">
        {(filterGroups || getFilterGroupsByCategory()).map((group) => (
          <div key={group.title} className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => toggleSection(group.title)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {group.title}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  expandedSections[group.title] ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections[group.title] && (
              <div className="mt-2">
                {renderFilterGroup(group)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}