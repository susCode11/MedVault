import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CONSTANTS } from '../../utils/constants';
import { Search, Filter, X } from 'lucide-react';
import { useRecordFilters } from '../../hooks/useRecords';

export const RecordFilter: React.FC = () => {
  const { filters, updateFilter, resetFilters } = useRecordFilters();
  const [isOpen, setIsOpen] = React.useState(false);

  const hasActiveFilters = (filters.category && filters.category !== 'all') || filters.searchQuery;

  return (
    <div className="mb-6 space-y-4 animate-fade-in">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search records by title or description..." 
            leftIcon={<Search size={18} />}
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilter({ searchQuery: e.target.value })}
            className="bg-surface-dark/50"
          />
        </div>
        <Button 
          variant={hasActiveFilters ? "primary" : "ghost"} 
          className="px-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter size={20} className="mr-2" />
          Filters
        </Button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 glass-card animate-slide-down origin-top">
          <Select
            label="Category"
            value={filters.category || 'all'}
            onChange={(e) => updateFilter({ category: (e.target.value as any) || 'all' })}
            options={[
              { label: 'All Categories', value: 'all' },
              ...CONSTANTS.RECORD_CATEGORIES.map(c => ({ label: c.label, value: c.id }))
            ]}
          />
          <div className="flex items-end pb-1">
            {hasActiveFilters && (
              <Button variant="ghost" onClick={resetFilters} className="text-danger-400 hover:text-danger-300 w-full">
                <X size={16} className="mr-2" /> Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
