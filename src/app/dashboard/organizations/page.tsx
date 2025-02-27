'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { useOrganizations, type UseOrganizationsOptions } from '@/lib/organizations/use-organizations';
import { OrganizationsFilters } from '@/components/dashboard/organizations/organizations-filters';
import { OrganizationsTable } from '@/components/dashboard/organizations/organizations-table';

export default function OrganizationsPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set up pagination state
  const [pagination, setPagination] = React.useState({
    page: Math.max(0, parseInt(searchParams.get('page') || '0', 10)),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  });

  // Set up filter state
  const [filters, setFilters] = React.useState<Omit<UseOrganizationsOptions, 'page' | 'limit'>>({
    status: searchParams.getAll('status').length > 0 ? searchParams.getAll('status') : undefined,
    search: searchParams.get('search') || undefined,
    includeDetails: false,
  });

  // Sync pagination state with URL search params
  React.useEffect(() => {
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    setPagination((prev) => {
      if (prev.page === page && prev.limit === limit) return prev;
      return { page, limit };
    });
  }, [searchParams]);

  // Fetch organizations data with filters
  const { data, isLoading } = useOrganizations({
    page: pagination.page + 1,
    limit: pagination.limit,
    ...filters,
  });

  // Update URL with pagination params
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());

    // Add filter params
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach((status) => {
        params.append('status', status);
      });
    }

    if (filters.search) {
      params.set('search', filters.search);
    }

    router.replace(`?${params.toString()}`);
  }, [pagination, filters, router]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 0, limit: newPageSize });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<UseOrganizationsOptions>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));

    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Organizations</Typography>
        <Button startIcon={<PlusIcon />} variant="contained">
          Add Organization
        </Button>
      </Stack>
      <OrganizationsFilters onFilterChange={handleFilterChange} />
      <OrganizationsTable
        count={data?.pagination.total}
        page={pagination.page}
        rows={data?.organizations ?? []}
        rowsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={isLoading}
      />
    </Stack>
  );
}
