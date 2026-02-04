import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Tab,
    Tabs
} from '@mui/material';
import {
    Assessment,
    History,
    FileDownload,
    Warning
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import StatusBadge from '../components/common/StatusBadge';

const Reports: React.FC = () => {
    const { measurements, discrepancies, batches } = useData();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Calculate Daily Stats
    const totalProduction = batches
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.currentQuantity, 0);

    const avgRecycledContent = batches.length > 0
        ? batches.reduce((sum, b) => sum + b.recycledPercentage, 0) / batches.length
        : 0;

    // Mock Audit Log (In real app, this would come from an AuditContext or API)
    const auditLog = [
        { id: 1, action: 'Batch Created', details: 'Batch B-2023-11-01 Created by Supervisor', time: '10:00 AM', user: 'Sarah Supervisor' },
        { id: 2, action: 'Discrepancy Resolved', details: 'Manual Match Confirmed for Input #45', time: '09:30 AM', user: 'Sarah Supervisor' },
        { id: 3, action: 'Measurement Recorded', details: 'Intake Weight: 500kg', time: '08:15 AM', user: 'John Operator' },
        { id: 4, action: 'System Login', details: 'User logged in', time: '08:00 AM', user: 'John Operator' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    Reports & Audit
                </Typography>
                <Button variant="outlined" startIcon={<FileDownload />}>
                    Export All Data
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab label="Daily Production Summary" icon={<Assessment />} iconPosition="start" />
                    <Tab label="Audit Trail" icon={<History />} iconPosition="start" />
                    <Tab label="Exception Log" icon={<Warning />} iconPosition="start" />
                </Tabs>
            </Paper>

            {/* Daily Summary Tab */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Production Today</Typography>
                                <Typography variant="h3" fontWeight="bold">{totalProduction} kg</Typography>
                                <Typography variant="caption" color="success.main">+12% vs avg</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Avg. Recycled Content</Typography>
                                <Typography variant="h3" fontWeight="bold">{avgRecycledContent.toFixed(1)}%</Typography>
                                <Typography variant="caption" color="text.secondary">Target: 60%</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Measurements Recorded</Typography>
                                <Typography variant="h3" fontWeight="bold">{measurements.length}</Typography>
                                <Typography variant="caption" color="text.secondary">Across 3 stations</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Production Batches</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {batches.map(batch => (
                                <Box key={batch.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography fontWeight="bold">{batch.productName} ({batch.productCode})</Typography>
                                        <StatusBadge status={batch.status === 'COMPLETED' ? 'success' : 'warning'} label={batch.status} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Output: {batch.currentQuantity} / {batch.targetQuantity} kg | Recycled: {batch.recycledPercentage}%
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Audit Trail Tab */}
            {tabValue === 1 && (
                <Paper>
                    <List>
                        {auditLog.map((log) => (
                            <React.Fragment key={log.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold">{log.action}</Typography>}
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {log.user} - {log.time}
                                                </Typography>
                                                <br />
                                                {log.details}
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Exception Log Tab */}
            {tabValue === 2 && (
                <Paper>
                    <List>
                        {discrepancies.map((disc) => (
                            <React.Fragment key={disc.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold" color="error">{disc.description}</Typography>}
                                        secondary={`Batch: ${disc.batchId} | Found: ${disc.detected.toLocaleDateString()}`}
                                    />
                                    <StatusBadge status={disc.status === 'RESOLVED' ? 'success' : 'error'} label={disc.status} />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                        {discrepancies.length === 0 && (
                            <ListItem><ListItemText primary="No exceptions found." /></ListItem>
                        )}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default Reports;
