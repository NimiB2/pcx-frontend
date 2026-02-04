import React, { useState } from 'react';
import { Box, Typography, Tooltip, IconButton, Popover, Divider } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

interface ImmutableValueProps {
    currentValue: string | number;
    previousValue?: string | number;
    unit?: string;
    history?: { user: string; date: string; reason: string; oldValue: string | number }[];
}

const ImmutableValue: React.FC<ImmutableValueProps> = ({ currentValue, previousValue, unit, history }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Previous Value (Strikethrough) */}
            {previousValue && (
                <Typography
                    variant="body2"
                    sx={{
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        opacity: 0.7,
                    }}
                >
                    {previousValue} {unit}
                </Typography>
            )}

            {/* Current Value */}
            <Typography variant="body1" fontWeight="bold">
                {currentValue} {unit}
            </Typography>

            {/* History Icon */}
            {history && history.length > 0 && (
                <>
                    <Tooltip title="View value history">
                        <IconButton size="small" onClick={handleHistoryClick} sx={{ padding: '2px' }}>
                            <HistoryIcon sx={{ fontSize: '1rem', color: 'action.active' }} />
                        </IconButton>
                    </Tooltip>

                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <Box sx={{ p: 2, maxWidth: 300 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Audit History
                            </Typography>
                            {history.map((record, index) => (
                                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {record.date} by {record.user}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                                        Old: {record.oldValue}
                                    </Typography>
                                    <Typography variant="body2" color="error">
                                        Reason: {record.reason}
                                    </Typography>
                                    {index < history.length - 1 && <Divider sx={{ my: 1 }} />}
                                </Box>
                            ))}
                        </Box>
                    </Popover>
                </>
            )}
        </Box>
    );
};

export default ImmutableValue;
