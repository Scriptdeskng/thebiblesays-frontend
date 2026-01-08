import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface CategoryDropdownProps {
  categories: string[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  categoryFilter,
  setCategoryFilter,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsCategoryOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-admin-primary transition"
      >
        <Filter size={18} />
        <span>{categoryFilter || 'All category'}</span>
      </button>

      {isCategoryOpen && (
        <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-accent-2 rounded-lg shadow-lg z-10">
          {['All category', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setIsCategoryOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent-1 transition
                ${categoryFilter === cat ? 'text-primary font-semibold' : 'text-grey'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
