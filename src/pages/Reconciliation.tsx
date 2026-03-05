import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
    Flag as FlagIcon,
    History as HistoryIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import ImmutableValue from '../components/common/ImmutableValue';
import OriginIcon from '../components/common/OriginIcon';
import StatusBadge from '../components/common/StatusBadge';
import EvidenceLink from '../components/common/EvidenceLink';
import SupersedeModal from '../components/modals/SupersedeModal';
import SLACountdown from '../components/common/SLACountdown';
import MESStatusWidget from '../components/common/MESStatusWidget';
import { useNotifications } from '../contexts/NotificationContext';
import { useData, Discrepancy } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useMES } from '../contexts/MESContext';
import { useAudit } from '../contexts/AuditContext';

const Reconciliation: React.FC = () => {
    const theme = useTheme();
    const { discrepancies, resolveDiscrepancy, acknowledgeDiscrepancy, addDiscrepancy } = useData();
    const { user } = useAuth();
    const { isOnline: mesOnline } = useMES();
    const { addLog } = useAudit();
    const { addNotification } = useNotifications();
    const [supersedeModalOpen, setSupersedeModalOpen] = useState(false);
    const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    // Filter only OPEN discrepancies for the main view (or all? usually console shows open)
    // For this view, let's show all but sort by status
    const displayData = discrepancies.map(d => ({
        id: d.id,
        batchId: d.batchId,
        material: 'Recycled HDPE', // Placeholder as it's not in Discrepancy model yet
        manual: {
            value: d.expectedValue || 0,
            unit: d.unit || 'kg',
            source: 'manual' as const,
            user: 'System'
        },
        mes: {
            value: d.actualValue || 0,
            unit: d.unit || 'kg',
            source: 'mes' as const,
            machine: 'Extruder A'
        },
        variance: ((d.difference || 0) / (d.expectedValue || 1)) * 100,
        status: d.status,
        original: d
    }));

    // Helper to calculate row style based on variance
    const getRowStyle = (variance: number) => {
        const absVariance = Math.abs(variance);
        if (absVariance > 5) {
            return { backgroundColor: '#FFEBEE' }; // Light Red for blocking error
        }
        if (absVariance > 2) {
            return { backgroundColor: '#FFFDE7' }; // Light Yellow for warning
        }
        return {};
    };

    const handleOpenSupersede = (row: any) => {
        setSelectedDiscrepancy(row);
        setSupersedeModalOpen(true);
    };

    const handleConfirmSupersede = (newValue: number, reason: string) => {
        if (selectedDiscrepancy) {
            resolveDiscrepancy(selectedDiscrepancy.id, `Superseded: ${reason} (New Value: ${newValue})`);
            addNotification({
                title: 'Discrepancy Superseded',
                message: `Record ${selectedDiscrepancy.id} superseded with new value ${newValue}.`,
                type: 'SUCCESS'
            });
            addLog('DISCREPANCY_RESOLVED', `Superseded discrepancy ${selectedDiscrepancy.id} with new value ${newValue} (Reason: ${reason})`, user?.role || 'system');
            setSnackbar({ open: true, message: `Record superseded successfully. New value: ${newValue}` });
        }
        setSupersedeModalOpen(false); // Close modal after confirm
    };

    const handleAcknowledge = (row: any) => {
        acknowledgeDiscrepancy(row.id);
        const discrepancy = discrepancies.find(d => d.id === row.id);
        addLog('DISCREPANCY_ACKNOWLEDGED', `Acknowledged discrepancy ${row.id} (${discrepancy?.type})`, user?.role || 'system');
        addNotification({
            title: 'Issue Acknowledged',
            message: `Discrepancy ${row.id} has been acknowledged.`,
            type: 'INFO'
        });
        setSnackbar({ open: true, message: 'Discrepancy acknowledged.' });
    };

    const handleFlagForSupervisor = (row: any) => {
        addNotification({
            title: 'Discrepancy Flagged',
            message: `Discrepancy ${row.id} has been flagged for supervisor review.`,
            type: 'WARNING'
        });
        setSnackbar({ open: true, message: 'Notification sent to manager' });
    };

    const handleExport = () => {
        setSnackbar({ open: true, message: 'Downloading Production Reconciliation Report...' });
        // Mock download
    };

    const handleRunNightlyCheck = () => {
        setSnackbar({ open: true, message: 'Running discrepancy detection...' });

        // Simulate finding a new discrepancy
        setTimeout(() => {
            const newDisc: Omit<Discrepancy, 'id'> = {
                type: 'MASS_BALANCE',
                severity: 'MEDIUM',
                description: 'Nightly scan: Unexplained variance between Extruder A and B',
                batchId: 'BATCH-2026-003',
                expectedValue: 800,
                actualValue: 750,
                difference: -50,
                unit: 'kg',
                detected: new Date(),
                status: 'OPEN',
                slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours SLA
            };
            addDiscrepancy(newDisc);
            addNotification({
                title: 'New Discrepancy Detected',
                message: 'Nightly check found a mass balance variance in BATCH-2026-003.',
                type: 'WARNING'
            });
            setSnackbar({ open: true, message: 'Scan complete. New issues found.' });
        }, 1500);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Production Reconciliation
                </Typography>
                <Box>
                    <Button variant="outlined" sx={{ mr: 1 }} onClick={handleExport}>Export Report</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRunNightlyCheck}
                        disabled={!mesOnline}
                        title={!mesOnline ? "MES Offline: Cannot run sync" : ""}
                    >
                        Run Nightly Sync
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <MESStatusWidget lastSync={new Date()} />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Batch ID</TableCell>
                            <TableCell>Material</TableCell>
                            <TableCell align="center" sx={{ borderLeft: '2px solid #ccc', bgcolor: '#f5f5f5' }}>
                                <OriginIcon type="manual" /> Manual
                            </TableCell>
                            <TableCell align="center" sx={{ borderLeft: '1px solid #eee', bgcolor: '#f5f5f5' }}>
                                <OriginIcon type="mes" /> MES
                            </TableCell>
                            <TableCell align="center" sx={{ borderLeft: '2px solid #ccc', bgcolor: '#fafafa' }}>
                                Variance (%)
                            </TableCell>
                            <TableCell align="center">SLA Countdown</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayData.map((row) => (
                            <TableRow key={row.id} sx={{
                                ...getRowStyle(row.variance),
                                opacity: row.status === 'RESOLVED' ? 0.5 : 1
                            }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.batchId}</TableCell>
                                <TableCell>{row.material}</TableCell>

                                {/* Manual Data Column */}
                                <TableCell align="center" sx={{ borderLeft: '2px solid #ccc' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <ImmutableValue currentValue={row.manual.value} unit={row.manual.unit} />
                                        <Typography variant="caption" color="text.secondary">By: {row.manual.user}</Typography>

                                        {/* Mock Justification Display - In real app, this comes from the specific measurement */}
                                        {Math.abs(row.variance) > 2 && (
                                            <Tooltip title="Operator Note: 'Scale display was fluctuating, took average.'">
                                                <Box sx={{
                                                    mt: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    bgcolor: 'warning.light',
                                                    color: 'warning.contrastText',
                                                    px: 1,
                                                    py: 0.2,
                                                    borderRadius: 1,
                                                    cursor: 'help',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    <span style={{ fontWeight: 'bold' }}>NOTE</span>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* MES Data Column */}
                                <TableCell align="center" sx={{ borderLeft: '1px solid #eee' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {row.mes.value > 0 ? (
                                            <>
                                                <ImmutableValue currentValue={row.mes.value} unit={row.mes.unit} />
                                                <Typography variant="caption" color="text.secondary">Mach: {row.mes.machine}</Typography>
                                            </>
                                        ) : (
                                            <Typography variant="caption" color="error" fontWeight="bold">NO DATA</Typography>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Variance Column */}
                                <TableCell align="center" sx={{ borderLeft: '2px solid #ccc', fontWeight: 'bold' }}>
                                    {row.original.type === 'CREDITS_AT_RISK' ? (
                                        <Typography color="error" fontWeight="800">RISK</Typography>
                                    ) : (
                                        <Typography
                                            color={Math.abs(row.variance) > 5 ? 'error' : Math.abs(row.variance) > 2 ? 'warning.main' : 'success.main'}
                                            fontWeight="800"
                                        >
                                            {row.variance > 0 ? '+' : ''}{row.variance.toFixed(2)}%
                                        </Typography>
                                    )}
                                </TableCell>

                                <TableCell align="center">
                                    <SLACountdown deadline={row.original.slaDeadline} resolvedAt={row.original.resolvedAt} status={row.status} />
                                </TableCell>

                                <TableCell align="center">
                                    {row.original.type === 'CREDITS_AT_RISK' ? (
                                        <Chip label="CREDITS AT RISK" color="error" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
                                    ) : (
                                        <StatusBadge
                                            status={row.status === 'RESOLVED' ? 'success' : row.status === 'ACKNOWLEDGED' ? 'info' : Math.abs(row.variance) > 5 ? 'error' : 'warning'}
                                            label={row.status}
                                        />
                                    )}
                                </TableCell>

                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="Correct Data (Supersede)">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    disabled={row.status === 'RESOLVED'}
                                                    onClick={() => handleOpenSupersede(row)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Acknowledge Issue">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    disabled={row.status === 'RESOLVED' || row.status === 'ACKNOWLEDGED'}
                                                    onClick={() => handleAcknowledge(row)}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Accept Manual as Truth">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    disabled={row.status === 'RESOLVED'}
                                                    onClick={() => resolveDiscrepancy(row.id, 'Manual Accepted')}
                                                >
                                                    <AcceptIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={!mesOnline ? "Offline: MES Data Unavailable" : "Accept MES as Truth"}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    disabled={row.status === 'RESOLVED' || !mesOnline}
                                                    onClick={() => resolveDiscrepancy(row.id, 'MES Accepted')}
                                                >
                                                    <HistoryIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Flag for Supervisor">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled={row.status === 'RESOLVED'}
                                                    onClick={() => handleFlagForSupervisor(row)}
                                                >
                                                    <FlagIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <EvidenceLink hasEvidence={true} count={2} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedDiscrepancy && (
                <SupersedeModal
                    open={supersedeModalOpen}
                    onClose={() => setSupersedeModalOpen(false)}
                    onConfirm={handleConfirmSupersede}
                    originalValue={selectedDiscrepancy.manual.value}
                    unit={selectedDiscrepancy.manual.unit}
                    batchId={selectedDiscrepancy.batchId}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default Reconciliation;
