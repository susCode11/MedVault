import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CONSTANTS } from '../../../utils/constants';
import { Search, Filter, X } from 'lucide-react';
import { useRecordStore } from '../../../store/recordStore';

export const RecordFilter: React.FC = () => {
  const { filters, setFilters } = useRecordStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const hasActiveFilters = filters.category || filters.status || filters.search;

  const clearFilters = () => {
    setFilters({ category: undefined, status: undefined, search: undefined });
  };

  return (
    <div className="mb-6 space-y-4 animate-fade-in">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search records by title or description..." 
            leftIcon={<Search size={18} />}
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 glass-card animate-slide-down origin-top">
          <Select
            label="Category"
            value={filters.category || ''}
            onChange={(e) => setFilters({ category: e.target.value as any || undefined })}
            options={[
              { label: 'All Categories', value: '' },
              ...CONSTANTS.RECORD_CATEGORIES.map(c => ({ label: c.label, value: c.id }))
            ]}
          />
          <Select
            label="Status"
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value as any || undefined })}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Archived', value: 'archived' }
            ]}
          />
          <div className="flex items-end pb-1">
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-danger-400 hover:text-danger-300 w-full">
                <X size={16} className="mr-2" /> Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
