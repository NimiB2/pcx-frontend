import React from 'react';
import { Paper, Box, Typography, Grid, Tooltip, Zoom } from '@mui/material';
import { Build, Warning, CheckCircle, PrecisionManufacturing } from '@mui/icons-material';

type StationStatus = 'RUNNING' | 'STOPPED' | 'MAINTENANCE' | 'ISSUE';

interface Station {
    id: string;
    name: string;
    status: StationStatus;
    efficiency: number; // 0-100
    activeUser?: string;
}

const mockStations: Station[] = [
    { id: '1', name: 'Intake A', status: 'RUNNING', efficiency: 95, activeUser: 'J. Doe' },
    { id: '2', name: 'Intake B', status: 'STOPPED', efficiency: 0 },
    { id: '3', name: 'Mixing 1', status: 'RUNNING', efficiency: 88, activeUser: 'A. Smith' },
    { id: '4', name: 'Mixing 2', status: 'ISSUE', efficiency: 45, activeUser: 'B. Jones' },
    { id: '5', name: 'Extruder X', status: 'RUNNING', efficiency: 92, activeUser: 'C. Ray' },
    { id: '6', name: 'Extruder Y', status: 'MAINTENANCE', efficiency: 0 },
];

const getStatusColor = (status: StationStatus) => {
    switch (status) {
        case 'RUNNING': return '#4caf50';
        case 'STOPPED': return '#9e9e9e';
        case 'MAINTENANCE': return '#ff9800';
        case 'ISSUE': return '#f44336';
        default: return '#e0e0e0';
    }
};

const getStatusIcon = (status: StationStatus) => {
    switch (status) {
        case 'RUNNING': return <PrecisionManufacturing fontSize="large" sx={{ color: 'white' }} />;
        case 'STOPPED': return <PrecisionManufacturing fontSize="large" sx={{ color: '#bdbdbd' }} />;
        case 'MAINTENANCE': return <Build fontSize="large" sx={{ color: 'white' }} />;
        case 'ISSUE': return <Warning fontSize="large" sx={{ color: 'white' }} />;
    }
};

const FactoryFloorMap: React.FC = () => {
    return (
        <Paper sx={{ p: 3, height: '100%', bgcolor: '#263238', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#eceff1' }}>
                    Factory Floor Live
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50' }} />
                        <Typography variant="caption" sx={{ color: '#b0bec5' }}>Running</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336' }} />
                        <Typography variant="caption" sx={{ color: '#b0bec5' }}>Issue</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff9800' }} />
                        <Typography variant="caption" sx={{ color: '#b0bec5' }}>Maint.</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                {mockStations.map((station) => (
                    <Box key={station.id}>
                        <Tooltip
                            title={
                                <Box sx={{ p: 1 }}>
                                    <Typography variant="subtitle2">{station.name}</Typography>
                                    <Typography variant="body2">Status: {station.status}</Typography>
                                    <Typography variant="body2">Eff: {station.efficiency}%</Typography>
                                    {station.activeUser && <Typography variant="caption">Op: {station.activeUser}</Typography>}
                                </Box>
                            }
                            TransitionComponent={Zoom}
                            arrow
                        >
                            <Box
                                sx={{
                                    bgcolor: getStatusColor(station.status),
                                    borderRadius: 2,
                                    p: 2,
                                    height: 100,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: 3,
                                    border: station.status === 'RUNNING' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                {getStatusIcon(station.status)}
                                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, color: station.status === 'STOPPED' ? '#424242' : 'white' }}>
                                    {station.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                ))}
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #37474f', display: 'flex', justifyContent: 'center' }}>
                <Typography variant="overline" color="grey.500" sx={{ letterSpacing: 2 }}>
                    North Production Wing
                </Typography>
            </Box>
        </Paper>
    );
};

export default FactoryFloorMap;
