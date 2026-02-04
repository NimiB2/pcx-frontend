import React from 'react';
import { Chip } from '@mui/material';
import { Schedule } from '@mui/icons-material';

const FutureLabel: React.FC = () => {
    return (
        <Chip
            icon={<Schedule sx={{ '&&': { color: 'inherit', fontSize: '0.9rem' } }} />}
            label="Future Phase"
            size="small"
            color="default" // Using default grey for "future/pending" state
            variant="outlined"
            sx={{
                verticalAlign: 'middle',
                ml: 1,
                color: 'text.secondary',
                borderColor: 'text.disabled',
                height: 20,
                fontSize: '0.65rem',
                '& .MuiChip-label': {
                    px: 1
                }
            }}
        />
    );
};

export default FutureLabel;
