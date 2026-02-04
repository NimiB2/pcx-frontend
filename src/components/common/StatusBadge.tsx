import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export type StatusType = 'error' | 'warning' | 'success' | 'info' | 'default';

interface StatusBadgeProps {
    status: StatusType;
    label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const theme = useTheme();

    let bgColor = theme.palette.grey[300]; // Default Gray
    let textColor = theme.palette.text.primary;

    switch (status) {
        case 'error': // Red: Blocking / Critical
            bgColor = theme.palette.error.main;
            textColor = theme.palette.error.contrastText;
            break;
        case 'warning': // Yellow: Warning / Deviation
            bgColor = theme.palette.warning.main;
            textColor = theme.palette.warning.contrastText;
            break;
        case 'success': // Green: Verified / Valid
            bgColor = theme.palette.success.main;
            textColor = theme.palette.success.contrastText;
            break;
        case 'info': // Blue-ish in standard, but Gray in Industrial
        case 'default':
            bgColor = theme.palette.grey[400]; // Darker gray for active info
            textColor = '#000000';
            break;
    }

    return (
        <Chip
            label={label}
            size="small"
            sx={{
                backgroundColor: bgColor,
                color: textColor,
                fontWeight: 700,
                fontSize: '0.70rem',
                height: '22px',
                borderRadius: '4px', // Rectangular "Tag" look
                textTransform: 'uppercase',
                border: '1px solid rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default StatusBadge;
