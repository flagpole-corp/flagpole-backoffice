'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { useOrganizations } from '@/lib/organizations/use-organizations';
import { OrganizationsFilters } from '@/components/dashboard/organizations/organizations-filters';
import { OrganizationsTable } from '@/components/dashboard/organizations/organizations-table';

export default function OrganizationsPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pagination, setPagination] = React.useState({
    page: Math.max(0, parseInt(searchParams.get('page') || '0', 10)),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  });

  // Sync state with URL search params
  React.useEffect(() => {
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    setPagination((prev) => {
      if (prev.page === page && prev.limit === limit) return prev;
      return { page, limit };
    });
  }, [searchParams]);

  const { data, isLoading } = useOrganizations({
    page: pagination.page + 1,
    limit: pagination.limit,
  });

  // Update URL when pagination changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    router.replace(`?${params.toString()}`);
  }, [pagination, router]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 0, limit: newPageSize });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Organizations</Typography>
        <Button startIcon={<PlusIcon />} variant="contained">
          Add Organization
        </Button>
      </Stack>
      <OrganizationsFilters />
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
