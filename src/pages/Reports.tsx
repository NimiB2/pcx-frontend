import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    Tabs,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Assessment,
    History,
    FileDownload,
    Warning,
    Inventory,
    Visibility,
    Code,
    PictureAsPdf,
    ExpandMore
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useAudit } from '../contexts/AuditContext';
import StatusBadge from '../components/common/StatusBadge';
import { generateEndOfDayReport, EndOfDayReport } from '../utils/endOfDayService';
import { BatchRecord } from '../services/batchService';
import { MeasurementRecord } from '../services/measurementService';
import { evidencePackageService } from '../utils/evidencePackageService';
import { mockEvidencePackage } from '../mockData';
import { exportToCSV, exportEodToPDF } from '../utils/exportUtils';

const Reports: React.FC = () => {
    const { measurements, discrepancies, batches } = useData();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const { logs } = useAudit();

    const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [eodReport, setEodReport] = useState<EndOfDayReport | null>(null);
    const [signOffNotes, setSignOffNotes] = useState('');

    // Evidence Packages State
    const [epStartDate, setEpStartDate] = useState('');
    const [epEndDate, setEpEndDate] = useState('');

    const [auditStartDate, setAuditStartDate] = useState('');
    const [auditEndDate, setAuditEndDate] = useState('');
    const [excStartDate, setExcStartDate] = useState('');
    const [excEndDate, setExcEndDate] = useState('');
    const [completenessThreshold, setCompletenessThreshold] = useState<number | ''>('');
    const [previewPackage, setPreviewPackage] = useState<any>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('tab') === 'eod') {
            setTabValue(0);
        }
    }, [location]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleGenerateReport = () => {
        // Adjust for timezone, basic split ensures YYYY-MM-DD
        const targetDate = new Date(reportDate + 'T12:00:00');
        const report = generateEndOfDayReport(batches as any as BatchRecord[], measurements as any as MeasurementRecord[], targetDate);
        setEodReport(report);
    };

    const handleSignOff = () => {
        if (!eodReport) return;
        setEodReport({
            ...eodReport,
            supervisorSignOff: {
                signedBy: user?.name || 'Supervisor',
                signedAt: new Date(),
                notes: signOffNotes
            }
        });
    };

    const getEvidencePackagesData = () => {
        const completedBatches = (batches as any as BatchRecord[]).filter(b => b.status === 'COMPLETED' || b.status === 'APPROVED_OVERDUE');
        return completedBatches.map(b => {
            const bMeasurements = (measurements as any[]).filter(m => m.batchId === b.id);
            const bDiscrepancies = (discrepancies as any[]).filter(d => d.batchId === b.id);
            const pkg = b.id === 'BATCH-2026-001' ? mockEvidencePackage : evidencePackageService.buildEvidencePackage(b, bMeasurements, bDiscrepancies);
            const measurementsWithEvidence = bMeasurements.filter(m => m.evidenceLinks && m.evidenceLinks.length > 0).length;
            const evidenceCompleteness = bMeasurements.length > 0 ? (measurementsWithEvidence / bMeasurements.length) * 100 : 0;

            return {
                batch: b,
                pkg: pkg as any,
                measurementsCount: bMeasurements.length,
                completeness: evidenceCompleteness,
                massBalanceStatus: pkg.massBalance.status
            };
        });
    };

    const evidencePackagesData = getEvidencePackagesData();
    const filteredPackages = evidencePackagesData.filter(item => {
        const dateToUse = item.batch.completionDate || item.batch.startDate;
        if (epStartDate && new Date(dateToUse) < new Date(epStartDate)) return false;
        if (epEndDate && new Date(dateToUse) > new Date(epEndDate)) return false;
        if (completenessThreshold !== '' && item.completeness < Number(completenessThreshold)) return false;
        return true;
    });

    const filteredLogs = logs.filter(log => {
        if (auditStartDate && new Date(log.timestamp) < new Date(auditStartDate)) return false;
        if (auditEndDate && new Date(log.timestamp) > new Date(auditEndDate + 'T23:59:59')) return false;
        return true;
    });

    const filteredDiscrepancies = discrepancies.filter(d => {
        if (excStartDate && new Date(d.detected) < new Date(excStartDate)) return false;
        if (excEndDate && new Date(d.detected) > new Date(excEndDate + 'T23:59:59')) return false;
        return true;
    });

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    Reports & Audit
                </Typography>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab label="End-of-Day Report" icon={<Assessment />} iconPosition="start" />
                    <Tab label="Audit Trail" icon={<History />} iconPosition="start" />
                    <Tab label="Exception Log" icon={<Warning />} iconPosition="start" />
                    <Tab label="Evidence Packages" icon={<Inventory />} iconPosition="start" />
                </Tabs>
            </Paper>

            {/* End-of-Day Report Tab */}
            {tabValue === 0 && (
                <Box>
                    {/* Header */}
                    <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                type="date"
                                label="Report Date"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <Button variant="contained" onClick={handleGenerateReport}>
                                Generate Report
                            </Button>
                            {eodReport && (
                                <>
                                    <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
                                        exportToCSV(eodReport.batches.map(b => ({
                                            BatchID: b.batchId, Product: b.productName, Input: b.totalInputKg, Output: b.totalOutputKg, Delta: b.massBalanceDelta, Reliability: b.reliabilityScore
                                        })), ['BatchID', 'Product', 'Input', 'Output', 'Delta', 'Reliability'], `EOD_${eodReport.date.toISOString().split('T')[0]}`);
                                    }}>CSV</Button>
                                    <Button variant="outlined" color="info" startIcon={<PictureAsPdf />} onClick={() => exportEodToPDF(eodReport)}>PDF</Button>
                                </>
                            )}
                        </Box>
                        {eodReport && (
                            <Chip
                                label={eodReport.supervisorSignOff ? 'SIGNED OFF' : (eodReport.requiresSupervisorSignOff ? 'PENDING SIGN-OFF' : 'NO SIGN-OFF REQUIRED')}
                                color={eodReport.supervisorSignOff ? 'success' : (eodReport.requiresSupervisorSignOff ? 'warning' : 'default')}
                                sx={{ fontWeight: 'bold' }}
                            />
                        )}
                    </Paper>

                    {eodReport && (
                        <>
                            {/* Summary KPI Row */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary" gutterBottom>Total Input Today</Typography>
                                            <Typography variant="h3" fontWeight="bold">{Math.round(eodReport.totalInputKg)} kg</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary" gutterBottom>Total Output Today</Typography>
                                            <Typography variant="h3" fontWeight="bold">{Math.round(eodReport.totalOutputKg)} kg</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary" gutterBottom>Credit Eligible</Typography>
                                            <Typography variant="h3" fontWeight="bold" color="primary.main">{Math.round(eodReport.totalCreditEligibleKg)} kg</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Card sx={{
                                        bgcolor: eodReport.overallReliabilityScore === 'HIGH' ? 'success.light' :
                                            eodReport.overallReliabilityScore === 'MEDIUM' ? 'warning.light' : 'error.light',
                                        color: eodReport.overallReliabilityScore === 'HIGH' ? 'success.dark' :
                                            eodReport.overallReliabilityScore === 'MEDIUM' ? 'warning.dark' : 'error.dark'
                                    }}>
                                        <CardContent>
                                            <Typography gutterBottom>Overall Reliability Score</Typography>
                                            <Typography variant="h3" fontWeight="bold">{eodReport.overallReliabilityScore}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Batch-Level Reliability Table */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>Batch-Level Reliability</Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Batch ID</TableCell>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Input (kg)</TableCell>
                                                <TableCell align="right">Output (kg)</TableCell>
                                                <TableCell align="right">MB Delta</TableCell>
                                                <TableCell>Reliability</TableCell>
                                                <TableCell align="center">Open Exceptions</TableCell>
                                                <TableCell>Credits at Risk</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {eodReport.batches.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center">No active batches for this date.</TableCell>
                                                </TableRow>
                                            ) : (
                                                eodReport.batches.map(b => (
                                                    <TableRow
                                                        key={b.batchId}
                                                        hover
                                                        onClick={() => navigate(`/batches/${b.batchId}`)}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{b.batchId}</TableCell>
                                                        <TableCell>{b.productName}</TableCell>
                                                        <TableCell align="right">{b.totalInputKg}</TableCell>
                                                        <TableCell align="right">{b.totalOutputKg}</TableCell>
                                                        <TableCell align="right" sx={{
                                                            color: b.massBalanceStatus === 'CRITICAL' ? 'error.main' :
                                                                b.massBalanceStatus === 'WARNING' ? 'warning.main' : 'success.main',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {b.massBalanceDelta > 0 ? '+' : ''}{Math.round(b.massBalanceDelta)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={b.reliabilityScore === 'HIGH' ? 'success' :
                                                                    b.reliabilityScore === 'MEDIUM' ? 'warning' : 'error'}
                                                                label={b.reliabilityScore}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">{b.openExceptions}</TableCell>
                                                        <TableCell>
                                                            {b.creditsAtRisk ? (
                                                                <Typography color="error" fontWeight="bold">Yes</Typography>
                                                            ) : (
                                                                <Typography color="success.main">No</Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>

                            <Grid container spacing={3}>
                                {/* Exception Summary */}
                                <Grid size={{ xs: 12, md: eodReport.requiresSupervisorSignOff ? 8 : 12 }}>
                                    <Paper sx={{ p: 3, height: '100%' }}>
                                        <Typography variant="h6" gutterBottom>Exception Summary</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <List>
                                            {discrepancies.filter(d => d.status === 'OPEN').length === 0 ? (
                                                <Typography color="text.secondary">No open exceptions for today.</Typography>
                                            ) : (
                                                discrepancies.filter(d => d.status === 'OPEN').map((disc) => (
                                                    <React.Fragment key={disc.id}>
                                                        <ListItem sx={{ px: 0 }}>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography fontWeight="bold" color={disc.severity === 'HIGH' ? 'error' : 'warning.main'}>
                                                                        {disc.type.replace('_', ' ')}: {disc.description}
                                                                    </Typography>
                                                                }
                                                                secondary={`Batch: ${disc.batchId} | Found: ${disc.detected.toLocaleDateString()}`}
                                                            />
                                                            <Button size="small" variant="outlined" onClick={() => navigate('/reconciliation')}>
                                                                Resolve
                                                            </Button>
                                                        </ListItem>
                                                        <Divider component="li" />
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </List>
                                    </Paper>
                                </Grid>

                                {/* Supervisor Sign-Off Panel */}
                                {eodReport.requiresSupervisorSignOff && (
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Paper sx={{
                                            p: 3,
                                            bgcolor: eodReport.supervisorSignOff ? 'success.50' : 'background.paper',
                                            border: eodReport.supervisorSignOff ? '1px solid' : 'none',
                                            borderColor: 'success.main'
                                        }}>
                                            <Typography variant="h6" gutterBottom color={eodReport.supervisorSignOff ? 'success.main' : 'text.primary'}>
                                                Supervisor Sign-Off
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />

                                            {eodReport.supervisorSignOff ? (
                                                <Box>
                                                    <Typography variant="body1" gutterBottom>
                                                        <strong>Signed By:</strong> {eodReport.supervisorSignOff.signedBy}
                                                    </Typography>
                                                    <Typography variant="body1" gutterBottom>
                                                        <strong>Date/Time:</strong> {eodReport.supervisorSignOff.signedAt.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Notes:</strong> {eodReport.supervisorSignOff.notes}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography variant="body2" color="error" gutterBottom sx={{ mb: 2 }}>
                                                        CRITICAL exceptions or Credits at Risk require supervisor review and sign-off.
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        label="Sign-Off Notes (Required)"
                                                        value={signOffNotes}
                                                        onChange={(e) => setSignOffNotes(e.target.value)}
                                                        sx={{ mb: 2 }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        fullWidth
                                                        onClick={handleSignOff}
                                                        disabled={!signOffNotes.trim() || (user?.role !== 'super_admin' && user?.role !== 'plant_engineer')}
                                                    >
                                                        Sign Off End of Day
                                                    </Button>
                                                    {(user?.role !== 'super_admin' && user?.role !== 'plant_engineer') && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                                                            Only supervisors can sign off.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}
                </Box>
            )}

            {/* Audit Trail Tab */}
            {tabValue === 1 && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6">Audit Log</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField type="date" label="Start Date" size="small" slotProps={{ inputLabel: { shrink: true } }} value={auditStartDate} onChange={e => setAuditStartDate(e.target.value)} />
                            <TextField type="date" label="End Date" size="small" slotProps={{ inputLabel: { shrink: true } }} value={auditEndDate} onChange={e => setAuditEndDate(e.target.value)} />
                            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
                                exportToCSV(filteredLogs.map(l => ({ Timestamp: l.timestamp.toLocaleString(), User: l.userRole, Action: l.action, Details: l.details, IP: l.ipAddress || 'N/A' })), ['Timestamp', 'User', 'Action', 'Details', 'IP'], 'Audit_Log');
                            }}>CSV</Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>User/Role</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Details</TableCell>
                                    <TableCell>IP Address</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No audit logs available.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                                            <TableCell>{log.userRole}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.action}
                                                    size="small"
                                                    color={log.action.includes('ERROR') || log.action.includes('FAILED') ? 'error' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{log.details}</TableCell>
                                            <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Exception Log Tab */}
            {tabValue === 2 && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <TextField type="date" label="Start Date" size="small" slotProps={{ inputLabel: { shrink: true } }} value={excStartDate} onChange={e => setExcStartDate(e.target.value)} />
                        <TextField type="date" label="End Date" size="small" slotProps={{ inputLabel: { shrink: true } }} value={excEndDate} onChange={e => setExcEndDate(e.target.value)} />
                        <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
                            exportToCSV(filteredDiscrepancies.map(d => ({ Found: d.detected.toLocaleDateString(), Batch: d.batchId, Type: d.type, Severity: d.severity, Description: d.description, Status: d.status })), ['Found', 'Batch', 'Type', 'Severity', 'Description', 'Status'], 'Exception_Log');
                        }}>CSV</Button>
                    </Box>
                    <List>
                        {filteredDiscrepancies.map((disc) => (
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
                        {filteredDiscrepancies.length === 0 && (
                            <ListItem><ListItemText primary="No exceptions found." /></ListItem>
                        )}
                    </List>
                </Paper>
            )}

            {/* Evidence Packages Tab */}
            {tabValue === 3 && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Filter Packages</Typography>
                            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
                                exportToCSV(filteredPackages.map(p => ({ BatchID: p.batch.id, Product: p.batch.productName, CompletionDate: p.batch.completionDate ? new Date(p.batch.completionDate).toLocaleDateString() : 'N/A', Measurements: p.measurementsCount, Completeness: `${p.completeness.toFixed(0)}%`, MassBalance: p.massBalanceStatus })), ['BatchID', 'Product', 'CompletionDate', 'Measurements', 'Completeness', 'MassBalance'], 'Evidence_Packages_Summary');
                            }}>Bulk CSV</Button>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Start Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={epStartDate}
                                    onChange={(e) => setEpStartDate(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="End Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={epEndDate}
                                    onChange={(e) => setEpEndDate(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Min Completeness %"
                                    value={completenessThreshold}
                                    onChange={(e) => setCompletenessThreshold(e.target.value ? Number(e.target.value) : '')}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Completed Batch Packages</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Batch ID</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Completion Date</TableCell>
                                        <TableCell>Measurements</TableCell>
                                        <TableCell>Completeness</TableCell>
                                        <TableCell>Mass Balance</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPackages.map((item) => (
                                        <TableRow key={item.batch.id}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{item.batch.id}</TableCell>
                                            <TableCell>{item.batch.productName}</TableCell>
                                            <TableCell>{item.batch.completionDate ? new Date(item.batch.completionDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{item.measurementsCount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${item.completeness.toFixed(0)}%`}
                                                    color={item.completeness >= 80 ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={item.massBalanceStatus === 'OK' ? 'success' : item.massBalanceStatus === 'WARNING' ? 'warning' : 'error'}
                                                    label={item.massBalanceStatus}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => setPreviewPackage(item.pkg)}>
                                                        Preview
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="info" startIcon={<Code />} onClick={() => evidencePackageService.exportAsJSON(item.pkg)}>
                                                        JSON
                                                    </Button>
                                                    <Button size="small" variant="contained" color="info" startIcon={<PictureAsPdf />} onClick={() => evidencePackageService.exportAsPDF(item.pkg)}>
                                                        PDF
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredPackages.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">No packages match the selected criteria.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Preview Package Modal */}
                    <Dialog open={!!previewPackage} onClose={() => setPreviewPackage(null)} maxWidth="md" fullWidth>
                        {previewPackage && (
                            <>
                                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">Evidence Package Preview</Typography>
                                    <Chip label={previewPackage.packageId} size="small" variant="outlined" />
                                </DialogTitle>
                                <DialogContent dividers>
                                    <Box sx={{ display: 'grid', gap: 2 }}>
                                        <Alert severity="info" icon={false}>
                                            <Typography variant="subtitle2">Generated: {new Date(previewPackage.generatedAt).toLocaleString()}</Typography>
                                            <Typography variant="subtitle2">By: {previewPackage.generatedBy}</Typography>
                                        </Alert>

                                        <Accordion defaultExpanded>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Typography fontWeight="bold">Batch & Material Information</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Product</Typography>
                                                        <Typography variant="body2">{previewPackage.batch.productName}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Source / Supplier</Typography>
                                                        <Typography variant="body2">{previewPackage.batch.source} / {previewPackage.batch.supplier}</Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>

                                        <Accordion>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Typography fontWeight="bold">Mass Balance ({previewPackage.massBalance.status})</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Total Input / Output</Typography>
                                                        <Typography variant="body2">{previewPackage.quantities.totalInputKg} kg / {previewPackage.quantities.finalOutputKg} kg</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Delta</Typography>
                                                        <Typography variant="body2" color={previewPackage.massBalance.status === 'OK' ? 'success.main' : 'error.main'}>
                                                            {previewPackage.massBalance.delta > 0 ? '+' : ''}{previewPackage.massBalance.delta} kg
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>

                                        <Accordion defaultExpanded>
                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                <Typography fontWeight="bold">Measurements & Evidence ({previewPackage.measurements.length})</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Station</TableCell>
                                                            <TableCell>Value</TableCell>
                                                            <TableCell>Reliability</TableCell>
                                                            <TableCell>GPS / Evidence</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {previewPackage.measurements.map((m: any) => (
                                                            <TableRow key={m.id}>
                                                                <TableCell>{m.station}</TableCell>
                                                                <TableCell>{m.value} {m.unit}</TableCell>
                                                                <TableCell>
                                                                    <Chip size="small" label={m.reliabilityScore} color={m.reliabilityScore === 'HIGH' ? 'success' : 'warning'} />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {m.gpsTag?.verified && <Chip size="small" label="GPS" color="info" sx={{ mr: 1 }} />}
                                                                    <Typography variant="caption">{m.evidenceLinks?.length || 0} Files</Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Box>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setPreviewPackage(null)}>Close</Button>
                                    <Button variant="contained" color="info" onClick={() => {
                                        evidencePackageService.exportAsPDF(previewPackage);
                                        setPreviewPackage(null);
                                    }}>
                                        Export PDF
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                </Box>
            )}
        </Box>
    );
};

export default Reports;

