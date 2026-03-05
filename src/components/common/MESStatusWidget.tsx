import React from 'react';
import { Paper, Box, Typography, LinearProgress } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useMES } from '../../contexts/MESContext';

interface MESStatusWidgetProps {
    status?: 'ONLINE' | 'OFFLINE';
    lastSync?: Date;
}

const MESStatusWidget: React.FC<MESStatusWidgetProps> = ({ lastSync = new Date() }) => {
    const { isOnline } = useMES();
    const status = isOnline ? 'ONLINE' : 'OFFLINE';

    return (
        <Paper sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: isOnline ? '#e8f5e9' : '#ffebee',
            borderLeft: '4px solid',
            borderColor: isOnline ? 'success.main' : 'error.main',
            boxShadow: 1
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isOnline ? <CheckCircle color="success" fontSize="large" /> : <ErrorIcon color="error" fontSize="large" />}
                <Box>
                    <Typography variant="h6" fontWeight="bold" color={isOnline ? 'success.dark' : 'error.dark'}>
                        MES Connection {status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last successful sync: {lastSync.toLocaleTimeString()}
                    </Typography>
                </Box>
            </Box>
            {isOnline && (
                <Box sx={{ width: 120, textAlign: 'center' }}>
                    <Typography variant="caption" color="success.dark" fontWeight="bold">SYNC ACTIVE</Typography>
                    <LinearProgress color="success" />
                </Box>
            )}
        </Paper>
    );
};

export default MESStatusWidget;
