'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  debounce?: number;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  debounce = 300,
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(controlledValue || '');

  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounce]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.();
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
          size={20}
        />
        <input
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-stone-950 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  );
}
