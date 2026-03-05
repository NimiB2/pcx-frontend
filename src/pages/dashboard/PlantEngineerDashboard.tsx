/**
 * PlantEngineerDashboard — operational overview for plant engineers.
 *
 * Accessible to `plant_engineer` and `super_admin`.
 * Surfaces three key widgets:
 * - Data Quality Overview (total/flagged measurements, manual-entry rate).
 * - Pending VRCQ Approvals (batches awaiting sign-off, linked to /vrcq).
 * - Open Discrepancies sorted by severity and detection time, linked to /reconciliation.
 *
 * Displays MES online/offline status in the header via MESContext.
 */
import React from 'react';

import {
    Box,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Grid
} from '@mui/material';
import {
    AssignmentTurnedIn,
    Warning,
    Speed,
    Assessment,
    ArrowForward,
    CheckCircle,
    Error as ErrorIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useMES } from '../../contexts/MESContext';
import StatusBadge, { StatusType } from '../../components/common/StatusBadge';
import { BatchRecord } from '../../services/batchService';

// Helper for strict status mapping
const getSeverityStatus = (severity: string): StatusType => {
    if (severity === 'HIGH' || severity === 'BLOCKING') return 'error';
    if (severity === 'MEDIUM' || severity === 'WARNING') return 'warning';
    return 'success';
};

const PlantEngineerDashboard: React.FC = () => {
    const { batches, discrepancies, measurements } = useData();
    const { isOnline: mesOnline } = useMES();

    // 1. Pending VRCQ Approvals
    const pendingVRCQBatches = batches.filter(
        b => b.vrcqApproval?.status === 'PENDING_APPROVAL'
    );

    // 2. Open Discrepancies (SLA-sorted: HIGH priority first)
    const openDiscrepancies = discrepancies
        .filter(d => d.status === 'OPEN')
        .sort((a, b) => {
            if (a.severity === 'HIGH' && b.severity !== 'HIGH') return -1;
            if (a.severity !== 'HIGH' && b.severity === 'HIGH') return 1;
            return new Date(b.detected).getTime() - new Date(a.detected).getTime();
        });

    // 3. Data Quality Overview
    const totalMeasurements = measurements.length;
    const flaggedMeasurements = measurements.filter(m => m.validationStatus === 'FLAGGED').length;
    const manualMeasurements = measurements.filter(m => m.source === 'MANUAL').length;

    const flagRate = totalMeasurements > 0 ? ((flaggedMeasurements / totalMeasurements) * 100).toFixed(1) : '0';
    const manualRate = totalMeasurements > 0 ? ((manualMeasurements / totalMeasurements) * 100).toFixed(1) : '0';

    return (
        <Box sx={{ pb: 8 }}>
            {/* Header / MES Status Widget */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: '#0d47a1', // Darker blue for engineering
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 3,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.1 }}>
                    <Speed sx={{ fontSize: 120, transform: 'translate(20px, 20px)' }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Plant Engineer Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                            icon={mesOnline ? <CheckCircle sx={{ color: '#4caf50 !important' }} /> : <ErrorIcon sx={{ color: '#f44336 !important' }} />}
                            label={mesOnline ? "MES ONLINE" : "MES OFFLINE"}
                            variant="outlined"
                            sx={{
                                color: mesOnline ? '#81c784' : '#e57373',
                                borderColor: mesOnline ? '#4caf50' : '#f44336',
                                fontWeight: 'bold'
                            }}
                        />
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {mesOnline ? 'Production Data Sync Active' : 'Fallback Mode: Sync Paused'}
                        </Typography>
                    </Box>
                </Box>

                {/* Quick Actions Navigation */}
                <Box sx={{ display: 'flex', gap: 2, zIndex: 1 }}>
                    <Button
                        component={Link}
                        to="/vrcq"
                        variant="contained"
                        color="secondary"
                        startIcon={<AssignmentTurnedIn />}
                        sx={{ fontWeight: 'bold' }}
                    >
                        VRCQ Approvals
                    </Button>
                    <Button
                        component={Link}
                        to="/reconciliation"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
                    >
                        Reconciliation
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Data Quality Overview Widget */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, height: '100%', borderTop: '4px solid', borderColor: 'info.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Assessment color="info" />
                            <Typography variant="h6" fontWeight="bold">Data Quality Overview</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Total Entries</Typography>
                                <Typography variant="h4" fontWeight="bold">{totalMeasurements}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Flagged</Typography>
                                <Typography variant="h4" fontWeight="bold" color={flaggedMeasurements > 0 ? "error.main" : "text.primary"}>
                                    {flaggedMeasurements} ({flagRate}%)
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">Manual Entries (Lower Reliability)</Typography>
                                    <Chip label={`${manualMeasurements} (${manualRate}%)`} size="small" color={manualMeasurements > 0 ? "warning" : "default"} />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Pending VRCQ Approvals Widget */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 0, height: '100%', borderTop: '4px solid', borderColor: pendingVRCQBatches.length > 0 ? 'warning.main' : 'success.main' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssignmentTurnedIn color={pendingVRCQBatches.length > 0 ? "warning" : "success"} />
                                <Typography variant="h6" fontWeight="bold">Pending VRCQ</Typography>
                            </Box>
                            <Chip label={pendingVRCQBatches.length} color={pendingVRCQBatches.length > 0 ? "warning" : "success"} size="small" />
                        </Box>
                        <List sx={{ p: 0 }}>
                            {pendingVRCQBatches.length > 0 ? (
                                pendingVRCQBatches.slice(0, 3).map((batch) => (
                                    <ListItem key={batch.id} divider>
                                        <ListItemText
                                            primary={batch.id}
                                            secondary={batch.productName}
                                        />
                                        <Button component={Link} to="/vrcq" size="small">Review</Button>
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No pending VRCQ approvals. All caught up!</Typography>}
                                    />
                                </ListItem>
                            )}
                            {pendingVRCQBatches.length > 3 && (
                                <ListItem sx={{ justifyContent: 'center' }}>
                                    <Button component={Link} to="/vrcq" size="small" endIcon={<ArrowForward />}>View all {pendingVRCQBatches.length}</Button>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Open Discrepancies (SLA-sorted) Widget */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 0, height: '100%', borderTop: '4px solid', borderColor: openDiscrepancies.length > 0 ? 'error.main' : 'success.main' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warning color={openDiscrepancies.length > 0 ? "error" : "success"} />
                                <Typography variant="h6" fontWeight="bold">Action Required</Typography>
                            </Box>
                            <Chip label={openDiscrepancies.length} color={openDiscrepancies.length > 0 ? "error" : "success"} size="small" />
                        </Box>
                        <List sx={{ p: 0 }}>
                            {openDiscrepancies.length > 0 ? (
                                openDiscrepancies.slice(0, 3).map((disc) => (
                                    <ListItem key={disc.id} divider>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: disc.severity === 'HIGH' ? 'bold' : 'normal' }} noWrap>
                                                    {disc.description}
                                                </Typography>
                                            }
                                            secondary={`Batch: ${disc.batchId}`}
                                        />
                                        <StatusBadge status={getSeverityStatus(disc.severity)} label={disc.severity} />
                                    </ListItem>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={<Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No open discrepancies.</Typography>}
                                    />
                                </ListItem>
                            )}
                            {openDiscrepancies.length > 0 && (
                                <ListItem sx={{ justifyContent: 'center' }}>
                                    <Button component={Link} to="/reconciliation" size="small" endIcon={<ArrowForward />}>
                                        Open Console
                                    </Button>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PlantEngineerDashboard;
