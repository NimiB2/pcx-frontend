import React, { useContext } from 'react';
import {
    Box, Paper, Typography, Grid, Divider, Button, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem,
    ListItemText, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    PictureAsPdf, Code, CheckCircle, Cancel, HourglassEmpty,
    ThumbUp, ThumbDown, Send
} from '@mui/icons-material';
import ImmutableValue from '../components/common/ImmutableValue';
import EvidenceLink from '../components/common/EvidenceLink';
import { evidencePackageService } from '../utils/evidencePackageService';
import { mockEvidencePackage } from '../mockData';
import { useData, DataContext } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAudit } from '../contexts/AuditContext';
import StatusBadge from '../components/common/StatusBadge';
import { calculateCreditEligibleInput } from '../utils/creditCalculations';
import { batchService, BatchRecord } from '../services/batchService';

const MassBalanceItem: React.FC<{
    label: string,
    value: number,
    unit: string,
    type: 'input' | 'output' | 'loss'
}> = ({ label, value, unit, type }) => {
    const theme = useTheme();
    let color = theme.palette.text.primary;
    if (type === 'input') color = theme.palette.success.main;
    if (type === 'loss') color = theme.palette.error.main;
    if (type === 'output') color = theme.palette.primary.main;

    return (
        <Card variant="outlined" sx={{ mb: 2, borderLeft: `4px solid ${color}` }}>
            <CardContent sx={{ pb: '16px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">
                        {label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        {value.toFixed(2)} {unit}
                    </Typography>
                </Box>
                <EvidenceLink hasEvidence={true} count={3} />
            </CardContent>
        </Card>
    );
};

/**
 * VRCQManager Component
 * 
 * Manages the Volume of Recycled Content Quality (VRCQ) calculations.
 * Includes VRCQ approval workflow with role-based actions.
 * 
 * @component
 */
const VRCQManager: React.FC = () => {
    const { measurements, discrepancies, batches, updateBatchStatus } = useData();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const { addLog } = useAudit();
    const [batchRecords, setBatchRecords] = React.useState<BatchRecord[]>([]);

    // Approval modal state
    const [approvalModal, setApprovalModal] = React.useState<{
        open: boolean;
        batch: BatchRecord | null;
        action: 'approve' | 'reject' | null;
    }>({ open: false, batch: null, action: null });
    const [approvalNotes, setApprovalNotes] = React.useState('');

    React.useEffect(() => {
        const fetchBatches = async () => {
            const data = await batchService.getBatches();
            setBatchRecords(data);
        };
        fetchBatches();
    }, []);

    // Determine role-based capabilities
    const canApproveReject = user?.role === 'super_admin' || user?.role === 'plant_engineer';
    const canSubmitForApproval = user?.role === 'super_admin' || user?.role === 'plant_engineer';
    const isReadOnly = user?.role === 'regulatory' || user?.role === 'field_worker';

    // Calculate aggregated credit eligibility from all completed/in-progress batches
    let totalInput = 0;
    let netInput = 0;
    let totalRigidKg = 0;
    let totalNonRigidKg = 0;
    let totalEligibleKg = 0;

    batchRecords.forEach(batch => {
        const breakdown = calculateCreditEligibleInput(batch, measurements);
        totalInput += breakdown.totalInput || 0;
        netInput += breakdown.netInput || 0;
        totalRigidKg += breakdown.rigidKg || 0;
        totalNonRigidKg += breakdown.nonRigidKg || 0;
        totalEligibleKg += breakdown.totalEligibleKg || 0;
    });

    const washingLoss = totalInput * 0.20;

    const overallRigidPercentage = totalEligibleKg > 0 ? (totalRigidKg / totalEligibleKg) * 100 : 0;
    const overallNonRigidPercentage = totalEligibleKg > 0 ? (totalNonRigidKg / totalEligibleKg) * 100 : 0;

    const [showExportModal, setShowExportModal] = React.useState(false);
    const completedBatches = batchRecords.filter(b => b.status === 'COMPLETED' || b.status === 'APPROVED_OVERDUE');

    const handleExportPackage = (format: 'PDF' | 'JSON', batchId: string) => {
        const batch = batchRecords.find(b => b.id === batchId);
        if (!batch) return;

        const bMeasurements = measurements.filter(m => (m as any).batchId === batchId);
        const bDiscrepancies = discrepancies.filter(d => (d as any).batchId === batchId);

        const pkg = batchId === 'BATCH-2026-001' ? mockEvidencePackage : evidencePackageService.buildEvidencePackage(batch, bMeasurements, bDiscrepancies);

        if (format === 'PDF') {
            evidencePackageService.exportAsPDF(pkg as any);
        } else {
            evidencePackageService.exportAsJSON(pkg as any);
        }
        setShowExportModal(false);
    };

    const handleApprovalAction = async () => {
        if (!approvalModal.batch || !approvalModal.action) return;
        const batchId = approvalModal.batch.id;
        const reviewerName = user?.name || 'Unknown';
        const selectedBatch = approvalModal.batch; // Alias for clarity based on diff

        try {
            if (approvalModal.action === 'approve') {
                await batchService.approveVRCQ(batchId, approvalNotes, reviewerName);
                addNotification({
                    title: 'VRCQ Approved',
                    message: `Batch ${batchId} has been approved.`,
                    type: 'SUCCESS',
                    link: '/vrcq'
                });
                addLog('VRCQ_APPROVED', `Batch ${selectedBatch.id} approved.`, user?.role || 'system');
            } else { // reject
                await batchService.rejectVRCQ(batchId, approvalNotes, reviewerName);
                addNotification({
                    title: 'VRCQ Rejected',
                    message: `Batch ${batchId} was rejected.`,
                    type: 'ERROR',
                    link: '/vrcq'
                });
                addLog('VRCQ_REJECTED', `Batch ${selectedBatch.id} rejected. Reason: ${approvalNotes || 'No reason provided.'}`, user?.role || 'system');
            }
            // Refresh batches
            const data = await batchService.getBatches();
            setBatchRecords(data);
        } catch (err) {
            console.error('Approval action failed:', err);
        }

        setApprovalModal({ open: false, batch: null, action: null });
        setApprovalNotes('');
    };

    const handleSubmitForApproval = async (batch: BatchRecord) => {
        try {
            await batchService.submitForVRCQApproval(batch.id, user?.name || 'Unknown');
            const data = await batchService.getBatches();
            setBatchRecords(data);
        } catch (err) {
            console.error('Submit for approval failed:', err);
        }
    };

    const getApprovalStatusChip = (batch: BatchRecord) => {
        if (!batch.vrcqApproval) {
            if (batch.status === 'COMPLETED' || batch.status === 'APPROVED_OVERDUE') {
                return <Chip label="Not Submitted" size="small" variant="outlined" />;
            }
            return <Chip label="N/A" size="small" variant="outlined" color="default" />;
        }

        switch (batch.vrcqApproval.status) {
            case 'PENDING_APPROVAL':
                return <Chip icon={<HourglassEmpty />} label="Pending Approval" size="small" color="warning" />;
            case 'APPROVED':
                return <Chip icon={<CheckCircle />} label="Approved" size="small" color="success" />;
            case 'REJECTED':
                return <Chip icon={<Cancel />} label="Rejected" size="small" color="error" />;
        }
    };

    // Batches relevant to VRCQ approval: completed or those with active approval
    const vrcqBatches = batchRecords.filter(b =>
        b.status === 'COMPLETED' || b.status === 'APPROVED_OVERDUE' || b.vrcqApproval
    );

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    Mass Balance (VRCQ) Calculation
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setShowExportModal(true)}>
                    Export Evidence Package
                </Button>
            </Box>

            {/* Export Evidence Package Dialog */}
            <Dialog open={showExportModal} onClose={() => setShowExportModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Export Evidence Package</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select a completed batch to generate its comprehensive Evidence Package.
                    </Typography>
                    {completedBatches.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                            No completed batches available for export.
                        </Typography>
                    ) : (
                        <List>
                            {completedBatches.map(batch => (
                                <ListItem
                                    key={batch.id}
                                    divider
                                    secondaryAction={
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="outlined" color="info" startIcon={<Code />} onClick={() => handleExportPackage('JSON', batch.id)}>
                                                JSON
                                            </Button>
                                            <Button size="small" variant="contained" color="info" startIcon={<PictureAsPdf />} onClick={() => handleExportPackage('PDF', batch.id)}>
                                                PDF
                                            </Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight="bold">{batch.id}</Typography>
                                                <Chip label={batch.status.replace('_', ' ')} size="small" color={batch.status === 'COMPLETED' ? 'success' : 'warning'} />
                                            </Box>
                                        }
                                        secondary={batch.productName}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowExportModal(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* VRCQ Approval Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    VRCQ Approval Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {isReadOnly
                        ? 'View-only access — approval actions require Plant Engineer or Super-Admin privileges.'
                        : 'Review and approve VRCQ calculations for completed batches.'}
                </Typography>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Batch ID</b></TableCell>
                                <TableCell><b>Product</b></TableCell>
                                <TableCell><b>Batch Status</b></TableCell>
                                <TableCell><b>VRCQ Status</b></TableCell>
                                <TableCell><b>Reviewed By</b></TableCell>
                                <TableCell><b>Reviewed At</b></TableCell>
                                {!isReadOnly && <TableCell align="center"><b>Actions</b></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vrcqBatches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isReadOnly ? 6 : 7} align="center">
                                        No batches ready for VRCQ approval.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vrcqBatches.map(batch => (
                                    <TableRow key={batch.id}>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{batch.id}</TableCell>
                                        <TableCell>{batch.productName}</TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={batch.status === 'COMPLETED' ? 'success' : batch.status === 'APPROVED_OVERDUE' ? 'warning' : 'info'}
                                                label={batch.status.replace(/_/g, ' ')}
                                            />
                                        </TableCell>
                                        <TableCell>{getApprovalStatusChip(batch)}</TableCell>
                                        <TableCell>{batch.vrcqApproval?.reviewedBy || '—'}</TableCell>
                                        <TableCell>
                                            {batch.vrcqApproval?.reviewedAt
                                                ? new Date(batch.vrcqApproval.reviewedAt).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        {!isReadOnly && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    {/* Submit for Approval — only if not yet submitted */}
                                                    {!batch.vrcqApproval && canSubmitForApproval && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Send />}
                                                            onClick={() => handleSubmitForApproval(batch)}
                                                        >
                                                            Submit
                                                        </Button>
                                                    )}
                                                    {/* Approve / Reject — only if pending */}
                                                    {batch.vrcqApproval?.status === 'PENDING_APPROVAL' && canApproveReject && (
                                                        <>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<ThumbUp />}
                                                                onClick={() => {
                                                                    setApprovalModal({ open: true, batch, action: 'approve' });
                                                                    setApprovalNotes('');
                                                                }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<ThumbDown />}
                                                                onClick={() => {
                                                                    setApprovalModal({ open: true, batch, action: 'reject' });
                                                                    setApprovalNotes('');
                                                                }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {/* Resubmit after rejection */}
                                                    {batch.vrcqApproval?.status === 'REJECTED' && canSubmitForApproval && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            startIcon={<Send />}
                                                            onClick={() => handleSubmitForApproval(batch)}
                                                        >
                                                            Resubmit
                                                        </Button>
                                                    )}
                                                    {batch.vrcqApproval?.status === 'APPROVED' && (
                                                        <Chip label="No Action Needed" size="small" variant="outlined" color="success" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Approval Confirmation Dialog */}
            <Dialog open={approvalModal.open} onClose={() => setApprovalModal({ open: false, batch: null, action: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: approvalModal.action === 'approve' ? 'success.main' : 'error.main' }}>
                    {approvalModal.action === 'approve' ? '✓ Approve VRCQ' : '✗ Reject VRCQ'}
                </DialogTitle>
                <DialogContent dividers>
                    {approvalModal.batch && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>{approvalModal.batch.id}</strong> — {approvalModal.batch.productName}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={approvalModal.action === 'approve' ? 'Approval Notes (optional)' : 'Rejection Reason (required)'}
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        required={approvalModal.action === 'reject'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApprovalModal({ open: false, batch: null, action: null })}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={approvalModal.action === 'approve' ? 'success' : 'error'}
                        onClick={handleApprovalAction}
                        disabled={approvalModal.action === 'reject' && !approvalNotes.trim()}
                    >
                        {approvalModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={4}>
                {/* Equation Visualizer */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#757575' }}>OFFICIAL FORMULA</Typography>
                        <Grid container alignItems="center" justifyContent="center" spacing={2}>
                            <Grid>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {totalInput.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" display="block">TOTAL INPUTS</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">-</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" color="error.main" fontWeight="bold">
                                    {washingLoss.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" display="block">WASHING LOSS (20%)</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">=</Typography>
                            </Grid>
                            <Grid>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main', borderWidth: 2, mr: 2 }}>
                                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                                        {netInput.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" display="block" fontWeight="bold">NET INPUT</Typography>
                                </Paper>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">➔</Typography>
                            </Grid>
                            <Grid>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Paper variant="outlined" sx={{ p: 1, borderColor: 'info.main', borderWidth: 2 }}>
                                        <Typography variant="h5" color="info.main" fontWeight="bold">
                                            {totalRigidKg.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" display="block" fontWeight="bold">RIGID ELIGIBLE</Typography>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 1, borderColor: 'secondary.main', borderWidth: 2 }}>
                                        <Typography variant="h5" color="secondary.main" fontWeight="bold">
                                            {totalNonRigidKg.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" display="block" fontWeight="bold">NON-RIGID ELIGIBLE</Typography>
                                    </Paper>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <MassBalanceItem label="Raw Material Inputs (Verified)" value={totalInput} unit="kg" type="input" />
                        <MassBalanceItem label="Washing & Filtering Loss (20%)" value={washingLoss} unit="kg" type="loss" />
                        <Divider sx={{ my: 2 }} />
                        <MassBalanceItem label="Rigid Credit Eligible" value={totalRigidKg} unit="kg" type="output" />
                        <MassBalanceItem label="Non-Rigid Credit Eligible" value={totalNonRigidKg} unit="kg" type="output" />
                        <Divider sx={{ my: 2 }} />
                        <MassBalanceItem label="Total Credit Eligible" value={totalEligibleKg} unit="kg" type="output" />
                    </Box>

                </Grid>

                {/* Sidebar Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Rigidity Breakdown</Typography>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${overallRigidPercentage}%`, bgcolor: 'info.main' }} />
                                    <Box sx={{ width: `${overallNonRigidPercentage}%`, bgcolor: 'secondary.main' }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="caption" color="info.main" fontWeight="bold">Rigid: {overallRigidPercentage.toFixed(1)}%</Typography>
                                    <Typography variant="caption" color="secondary.main" fontWeight="bold">Non-Rigid: {overallNonRigidPercentage.toFixed(1)}%</Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Total Eligible: <strong>{totalEligibleKg.toFixed(2)} kg</strong>
                            </Typography>
                        </CardContent>
                    </Card>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Calculation Rules</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" paragraph>
                            The Credit Eligible Input calculation handles Rigid and Non-Rigid materials distinctly:
                        </Typography>
                        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                            <li><strong>20% Washing Deduction:</strong> A flat 20% loss is deducted from all total tracked inputs.</li>
                            <li><strong>Proportional Split:</strong> The remaining net amount is proportionally allocated between Rigid and Non-Rigid material amounts based on the predefined composition percentages.</li>
                            <li><strong>Returned Materials:</strong> Material returned to the warehouse is not counted as eligible output for the current batch. However, when it re-enters production as an input in a future batch, it retains its original preserved rigidity percentage and is fully credited.</li>
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Last calculated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box >
    );
};

export default VRCQManager;
