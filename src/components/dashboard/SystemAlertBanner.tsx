import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Collapse, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const SystemAlertBanner: React.FC = () => {
    const [open, setOpen] = useState(true);

    // Mock alert data - could come from props or context later
    const alert = {
        severity: 'info' as const,
        title: 'System Maintenance Scheduled',
        message: 'The system will undergo scheduled maintenance tonight from 02:00 to 04:00 AM. Please sync all offline data before 01:45 AM.'
    };

    if (!open) return null;

    return (
        <Box sx={{ width: '100%', mb: 3 }}>
            <Collapse in={open}>
                <Alert
                    severity={alert.severity}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mb: 2, boxShadow: 1 }}
                >
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.message}
                </Alert>
            </Collapse>
        </Box>
    );
};

export default SystemAlertBanner;
