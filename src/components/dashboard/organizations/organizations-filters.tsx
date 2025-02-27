import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddTaskIcon from '@mui/icons-material/AddTask';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { TableFilter } from '@/components/table-filter';

export const subscriptionStatusItems = [
  {
    key: 'demo_requested',
    value: 'Demo Requested',
  },
  {
    key: 'active',
    value: 'Active',
  },
  {
    key: 'trial',
    value: 'Trial',
  },
  {
    key: 'expired',
    value: 'Expired',
  },
  {
    key: 'cancelled',
    value: 'Cancelled',
  },
  {
    key: 'inactive',
    value: 'Inactive',
  },
];

interface OrganizationsFiltersProps {
  onFilterChange: (filters: { status?: string[]; search?: string }) => void;
}

export function OrganizationsFilters({ onFilterChange }: OrganizationsFiltersProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize search from URL params
  const [searchValue, setSearchValue] = React.useState<string>(searchParams.get('search') || '');

  // Handle status filter changes
  const handleStatusChange = (selectedStatuses: string[]) => {
    onFilterChange({ status: selectedStatuses.length > 0 ? selectedStatuses : undefined });

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());

    if (selectedStatuses.length > 0) {
      params.delete('status');
      selectedStatuses.forEach((status) => {
        params.append('status', status);
      });
    } else {
      params.delete('status');
    }

    router.replace(`?${params.toString()}`);
  };

  // Create a custom debounce hook for the search function
  const useDebounce = <T extends (value: string) => void>(
    callback: T,
    delay: number
  ): [(value: string) => void, () => void] => {
    // Use ReturnType of setTimeout which works in both browser and Node environments
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFn = React.useCallback(
      (value: string) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(value);
        }, delay);
      },
      [callback, delay]
    );

    const cancel = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, []);

    // Clean up on unmount
    React.useEffect(() => {
      return cancel;
    }, [cancel]);

    return [debouncedFn, cancel];
  };

  // Create the search handler with custom debounce
  const handleSearch = React.useCallback(
    (value: string) => {
      onFilterChange({ search: value || undefined });

      // Update URL params
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.replace(`?${params.toString()}`);
    },
    [onFilterChange, router, searchParams]
  );

  const [debouncedSearch] = useDebounce(handleSearch, 300);

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    debouncedSearch(newValue);
  };

  // Initialize status filters from URL
  React.useEffect(() => {
    const statusParams = searchParams.getAll('status');
    if (statusParams.length > 0) {
      onFilterChange({ status: statusParams });
    }
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <TableFilter
        icon={AddTaskIcon}
        title="Status"
        items={subscriptionStatusItems}
        onSelectionChange={handleStatusChange}
        initialSelected={searchParams.getAll('status')}
      />
      <OutlinedInput
        value={searchValue}
        onChange={handleSearchChange}
        fullWidth
        placeholder="Search organization"
        size="small"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px', float: 'right' }}
      />
    </Card>
  );
}
