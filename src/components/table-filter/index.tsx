import * as React from 'react';
import { useRef, useState, type ComponentType, type ReactNode } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  Fade,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';

interface Items {
  key: string;
  value: string;
}

interface TableFilterProps {
  icon: ComponentType;
  title: string;
  items: Items[];
  onSelectionChange?: (selected: string[]) => void;
  initialSelected?: string[];
}

interface FilterPopperProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  items: Items[];
  onSelectionChange?: (selected: string[]) => void;
  initialSelected?: string[];
}

export function FilterPopper({
  open,
  anchorEl,
  onClose,
  items,
  onSelectionChange,
  initialSelected = [],
}: FilterPopperProps): ReactNode {
  const [checked, setChecked] = useState<string[]>(initialSelected);

  // Handle filter toggle
  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    // Notify parent component of the selection change
    if (onSelectionChange) {
      onSelectionChange(newChecked);
    }
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-start" transition sx={{ zIndex: 1300 }}>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={4}
            sx={{
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <ClickAwayListener onClickAway={onClose}>
              <Box>
                {items.map((item) => (
                  <ListItem key={item.key} disablePadding>
                    <ListItemButton role={undefined} onClick={handleToggle(item.key)} dense>
                      <ListItemIcon>
                        <Checkbox edge="start" checked={checked.includes(item.key)} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText id={item.key} primary={item.value} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
}

export function TableFilter({
  icon: Icon,
  title,
  items,
  onSelectionChange,
  initialSelected = [],
}: TableFilterProps): React.ReactNode {
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const [popperOpen, setPopperOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelected);

  const handleOpenPopper = (): void => {
    setPopperOpen(true);
  };

  const handleClosePopper = (): void => {
    setPopperOpen(false);
  };

  const handleSelectionChange = (selected: string[]) => {
    setSelectedItems(selected);
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  };

  // Map keys to display values for the selected filters
  const getSelectedLabels = () => {
    return selectedItems.map((key) => {
      const item = items.find((item) => item.key === key);
      return item ? item.value : key;
    });
  };

  const selectedLabels = getSelectedLabels();

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<Icon />}
          endIcon={popperOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          color="primary"
          ref={tagButtonRef}
          variant="outlined"
          onClick={handleOpenPopper}
        >
          <Typography>{title}</Typography>
        </Button>

        {selectedItems.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {selectedLabels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                onDelete={() => {
                  const key = items.find((item) => item.value === label)?.key;
                  if (key) {
                    const newSelection = selectedItems.filter((item) => item !== key);
                    handleSelectionChange(newSelection);
                  }
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <FilterPopper
        items={items}
        anchorEl={tagButtonRef.current}
        open={popperOpen}
        onClose={handleClosePopper}
        onSelectionChange={handleSelectionChange}
        initialSelected={selectedItems}
      />
    </>
  );
}
