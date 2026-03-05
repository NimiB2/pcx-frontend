import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Button,
    Chip,
    Divider
} from '@mui/material';
import {
    Gavel,
    Assessment,
    Shield,
    History as HistoryIcon,
    ArrowForward,
    FolderShared,
    AssignmentTurnedIn
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

const RegulatoryDashboard: React.FC = () => {
    const { batches, discrepancies } = useData();

    // 1. Compliance Score calculation (mock)
    const totalBatches = batches.length;
    const closedBatches = batches.filter(b => b.status === 'COMPLETED').length;

    const complianceScore = 98.5; // High score for pilot

    // 2. Recent Audit Trail Entries (mocked for now, will connect to AuditService in Phase 11)
    const recentAudits = [
        { id: '1', action: 'VRCQ_APPROVED', user: 'Sarah Supervisor', target: 'BATCH-2026-001', time: '10 mins ago' },
        { id: '2', action: 'DISCREPANCY_RESOLVED', user: 'Plant Manager', target: 'DISC-002', time: '1 hour ago' },
        { id: '3', action: 'EVIDENCE_UPLOADED', user: 'Super Admin', target: 'DOC-001', time: '3 hours ago' },
        { id: '4', action: 'LOGIN_FAILED', user: 'Unknown IP', target: 'System', time: '5 hours ago' }
    ];

    // 3. Outstanding Issues (High severity open discrepancies)
    const criticalIssues = discrepancies.filter(d => d.status === 'OPEN' && d.severity === 'HIGH').length;

    return (
        <Box sx={{ pb: 8 }}>
            {/* Header */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: '#455a64', // Blue-grey for regulatory
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 3,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.1 }}>
                    <Gavel sx={{ fontSize: 120, transform: 'translate(20px, 20px)' }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Regulatory & Compliance Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                            icon={<Shield sx={{ color: '#fff !important' }} />}
                            label="READ-ONLY ACCESS"
                            variant="outlined"
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}
                        />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            All actions are logged for audit purposes
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* System Overview Widget / Compliance Score */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, height: '100%', borderTop: '4px solid', borderColor: 'primary.main', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Shield color="primary" />
                            <Typography variant="h6" fontWeight="bold">Compliance Health</Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h2" fontWeight="bold" color="primary.main">
                                {complianceScore}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Overall System Compliance Rating
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }} textAlign="center">
                                <Typography variant="h6">{totalBatches}</Typography>
                                <Typography variant="caption" color="text.secondary">Total Batches</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }} textAlign="center">
                                <Typography variant="h6" color={criticalIssues > 0 ? 'error' : 'success'}>{criticalIssues}</Typography>
                                <Typography variant="caption" color="text.secondary">Critical Issues</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Recent Audit Trail Widget */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 0, height: '100%', borderTop: '4px solid', borderColor: 'secondary.main' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon color="secondary" />
                                <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                            </Box>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {recentAudits.map((audit) => (
                                <ListItem key={audit.id} divider>
                                    <ListItemText
                                        primary={<Typography variant="body2" fontWeight="bold">{audit.action}</Typography>}
                                        secondary={
                                            <React.Fragment>
                                                <Typography variant="caption" display="block">By: {audit.user}</Typography>
                                                <Typography variant="caption" color="text.secondary">{audit.time} • {audit.target}</Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))}
                            <ListItem sx={{ justifyContent: 'center' }}>
                                <Button component={Link} to="/reports" size="small" endIcon={<ArrowForward />}>View Full Audit Log</Button>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Quick Links Widget */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 0, height: '100%', borderTop: '4px solid', borderColor: 'info.main' }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #eee' }}>
                            <Assessment color="info" />
                            <Typography variant="h6" fontWeight="bold">Data Explorer</Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                            <ListItem disablePadding divider>
                                <ListItemButton component={Link} to="/documents">
                                    <FolderShared sx={{ mr: 2, color: 'text.secondary' }} />
                                    <ListItemText primary="Certification Documents" secondary="View and download licenses & permits" />
                                    <ArrowForward fontSize="small" color="action" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding divider>
                                <ListItemButton component={Link} to="/vrcq">
                                    <AssignmentTurnedIn sx={{ mr: 2, color: 'text.secondary' }} />
                                    <ListItemText primary="VRCQ Approvals" secondary="Review mass balance calculations" />
                                    <ArrowForward fontSize="small" color="action" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component={Link} to="/reports">
                                    <Assessment sx={{ mr: 2, color: 'text.secondary' }} />
                                    <ListItemText primary="System Reports" secondary="Export end-of-day reports" />
                                    <ArrowForward fontSize="small" color="action" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RegulatoryDashboard;
