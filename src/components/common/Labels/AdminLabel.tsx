import React from 'react';
import { Chip } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

const AdminLabel: React.FC = () => {
    return (
        <Chip
            icon={<AdminPanelSettings sx={{ '&&': { color: 'inherit', fontSize: '0.9rem' } }} />}
            label="Admin"
            size="small"
            color="error"
            variant="filled"
            sx={{
                verticalAlign: 'middle',
                ml: 1,
                fontWeight: 'bold',
                height: 20,
                fontSize: '0.65rem',
                '& .MuiChip-label': {
                    px: 1
                }
            }}
        />
    );
};

export default AdminLabel;
