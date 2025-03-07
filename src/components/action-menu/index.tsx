'use client';

import * as React from 'react';
import AddTaskIcon from '@mui/icons-material/AddTask';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

import { useActivateOrganization } from '@/lib/organizations/use-organizations';
import type { Organization } from '@/lib/organizations/use-organizations';

interface ActionMenuProps {
  row: Organization;
  onViewOrganization?: (id: string) => void;
  onEditOrganization?: (id: string) => void;
  onDeleteOrganization?: (id: string) => void;
}

export function ActionMenu({
  row,
  onViewOrganization,
  onEditOrganization,
  onDeleteOrganization,
}: ActionMenuProps): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Get the mutation hook
  const activateOrganizationMutation = useActivateOrganization();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    onViewOrganization?.(row._id);
    handleClose();
  };

  const handleEdit = () => {
    onEditOrganization?.(row._id);
    handleClose();
  };

  const handleDelete = () => {
    onDeleteOrganization?.(row._id);
    handleClose();
  };

  const handleActivate = () => {
    activateOrganizationMutation.mutate({
      organizationId: row._id,
      options: { activateUsers: true },
    });
    handleClose();
  };

  const shouldShowActivate = row.subscription.status !== 'active';

  const isActivatingThisOrg =
    activateOrganizationMutation.isPending && activateOrganizationMutation.variables?.organizationId === row._id;

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="View">
          <IconButton size="small" onClick={handleView}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="More">
          <IconButton
            size="small"
            onClick={handleClick}
            aria-controls={open ? `actions-menu-${row._id}` : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        id={`actions-menu-${row._id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {shouldShowActivate ? (
          <MenuItem onClick={handleActivate} sx={{ color: 'success.main' }} disabled={isActivatingThisOrg}>
            {isActivatingThisOrg ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <AddTaskIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            Activate
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Stack>
  );
}
