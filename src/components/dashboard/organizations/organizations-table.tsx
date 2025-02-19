'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import type { Organization } from '@/lib/organizations/use-organizations';

interface OrganizationsTableProps {
  count?: number;
  page?: number;
  rows?: Organization[];
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

export function OrganizationsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: OrganizationsTableProps): React.JSX.Element {
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'slug',
      headerName: 'Slug',
      width: 200,
    },
    {
      field: 'subscription',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Chip
          label={params.row.subscription.status}
          color={params.row.subscription.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'plan',
      headerName: 'Plan',
      width: 150,
      renderCell: (params: GridRenderCellParams<Organization>) => params.row.subscription.plan,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
      renderCell: (params: GridRenderCellParams<Organization>) => dayjs(params.row.createdAt).format('MMM D, YYYY'),
    },
  ];

  const handlePaginationModelChange = React.useCallback(
    (model: { page: number; pageSize: number }) => {
      if (model.pageSize !== rowsPerPage) {
        onPageSizeChange?.(model.pageSize);
      } else {
        onPageChange?.(model.page);
      }
    },
    [onPageChange, onPageSizeChange, rowsPerPage]
  );

  return (
    <Card>
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={count}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          paginationModel={{
            page,
            pageSize: rowsPerPage,
          }}
          onPaginationModelChange={handlePaginationModelChange}
          getRowId={(row: Organization) => row._id}
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
        />
      </Box>
    </Card>
  );
}
