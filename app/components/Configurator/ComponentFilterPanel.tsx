import React, { useState, useEffect, useCallback } from 'react'
import { Filter, Search, X, ChevronDown } from 'lucide-react'

interface ComponentFilterPanelProps {
  category: string
  onFilterChange: (filters: string[]) => void
  searchQuery?: string
  onSearchChange: (query: string) => void
}

const ComponentFilterPanel: React.FC<ComponentFilterPanelProps> = ({ 
  category, 
  onFilterChange,
  searchQuery = '',
  onSearchChange
}) => {
  const [expanded, setExpanded] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    setActiveFilters([])
    onFilterChange([])
  }, [category, onFilterChange])

  const getFilterOptions = useCallback(() => {
    switch (category) {
      case 'gpu':
        return [
          { value: 'nvidia-rtx-40', label: 'NVIDIA RTX 40 Series' },
          { value: 'nvidia-rtx-30', label: 'NVIDIA RTX 30 Series' },
          { value: 'nvidia-rtx-20', label: 'NVIDIA RTX 20 Series' },
          { value: 'nvidia-gtx-16', label: 'NVIDIA GTX Series' },
          { value: 'amd-rx-7000', label: 'AMD RX 7000 Series' },
          { value: 'amd-rx-6000', label: 'AMD RX 6000 Series' },
          { value: 'intel-arc', label: 'Intel Arc' },
        ]
      case 'cpu':
        return [
          { value: 'intel-core-i9', label: 'Intel Core i9' },
          { value: 'intel-core-i7', label: 'Intel Core i7' },
          { value: 'intel-core-i5', label: 'Intel Core i5' },
          { value: 'intel-core-i3', label: 'Intel Core i3' },
          { value: 'amd-ryzen-9', label: 'AMD Ryzen 9' },
          { value: 'amd-ryzen-7', label: 'AMD Ryzen 7' },
          { value: 'amd-ryzen-5', label: 'AMD Ryzen 5' },
          { value: 'amd-ryzen-3', label: 'AMD Ryzen 3' },
        ]
      case 'case':
        return [
          { value: 'atx', label: 'ATX' },
          { value: 'micro-atx', label: 'Micro-ATX' },
          { value: 'mini-itx', label: 'Mini-ITX' },
          { value: 'full-tower', label: 'Full Tower' },
          { value: 'mid-tower', label: 'Mid Tower' },
        ]
      case 'cooling':
        return [
          { value: 'air', label: 'Air Cooling' },
          { value: 'aio', label: 'AIO Liquid' },
          { value: 'custom-loop', label: 'Custom Loop' },
          { value: '240mm', label: '240mm Radiator' },
          { value: '360mm', label: '360mm Radiator' },
        ]
      case 'motherboard':
        return [
          { value: 'atx', label: 'ATX' },
          { value: 'micro-atx', label: 'Micro-ATX' },
          { value: 'mini-itx', label: 'Mini-ITX' },
          { value: 'z790', label: 'Intel Z790' },
          { value: 'b760', label: 'Intel B760' },
          { value: 'x670', label: 'AMD X670' },
          { value: 'b650', label: 'AMD B650' },
        ]
      case 'ram':
        return [
          { value: 'ddr5', label: 'DDR5' },
          { value: 'ddr4', label: 'DDR4' },
        ]
      case 'storage':
        return [
          { value: 'nvme', label: 'NVMe SSD' },
          { value: 'sata-ssd', label: 'SATA SSD' },
          { value: 'hdd', label: 'HDD' },
        ]
      case 'psu':
        return [
          { value: '1000w+', label: '1000W+' },
          { value: '850w-999w', label: '850W-999W' },
          { value: '750w-849w', label: '750W-849W' },
          { value: '650w-749w', label: '650W-749W' },
          { value: 'below-650w', label: 'Below 650W' },
        ]
      default:
        return []
    }
  }, [category])

  const toggleFilter = useCallback((value: string) => {
    setActiveFilters(prevFilters => {
      const newFilters = prevFilters.includes(value)
        ? prevFilters.filter(f => f !== value)
        : [...prevFilters, value]

      onFilterChange(newFilters)
      return newFilters
    })
  }, [onFilterChange])
  
  const clearFilters = useCallback(() => {
    setActiveFilters([])
    onFilterChange([])
  }, [onFilterChange])
  
  const filterOptions = getFilterOptions()
  
  if (filterOptions.length === 0) {
    return null
  }
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center text-white font-medium">
          <Filter size={18} className="mr-2" />
          Filter Components
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-800">
          {/* Search input */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Filter options */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleFilter(option.value)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilters.includes(option.value)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Clear filters button - only show if there are active filters */}
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-red-400 hover:text-red-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(ComponentFilterPanel)