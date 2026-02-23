import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    LinearProgress,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ArrowBack,
    Recycling,
    Science,
    Grass,
    TrendingUp,
    Delete as DeleteIcon,
    Schedule,
    Assessment,
    CheckCircle,
    ExpandMore,
    PictureAsPdf,
    Code,
    Visibility,
} from '@mui/icons-material';
import { evidencePackageService } from '../utils/evidencePackageService';
import { mockEvidencePackage } from '../mockData';
import { batchService, BatchRecord } from '../services/batchService';
import { measurementService } from '../services/measurementService';
import { calculateBatchCreditEligibleInput, assessCreditsAtRisk } from '../utils/creditCalculations';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { checkBatchOverdueStatus } from '../utils/batchValidation';

/**
 * BatchDetail Component
 * 
 * Displays comprehensive details for a specific production batch.
 * It visualizes key metrics (recycled content, yield, waste), material composition,
 * quantity tracking progress, and lists all linked measurement records.
 * 
 * @component
 */
const BatchDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [batch, setBatch] = useState<BatchRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const { discrepancies } = useData();

    const [showOutputDialog, setShowOutputDialog] = useState(false);
    const [outputType, setOutputType] = useState('FINAL_PRODUCT');
    const [outputQuantity, setOutputQuantity] = useState('');
    const [outputNotes, setOutputNotes] = useState('');

    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalReason, setApprovalReason] = useState('');

    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [returnQuantity, setReturnQuantity] = useState('');
    const [destinationWarehouse, setDestinationWarehouse] = useState('');
    const [returnRigidPercentage, setReturnRigidPercentage] = useState(0);
    const [returnedMaterials, setReturnedMaterials] = useState<any[]>([]);

    const [showPreviewModal, setShowPreviewModal] = useState(false);

    useEffect(() => {
        if (batch && returnedMaterials.length === 0) {
            let totalRigid = 0;
            let totalPercentage = 0;
            batch.composition.forEach(comp => {
                totalPercentage += comp.percentage;
                if (comp.rigidity === 'RIGID') {
                    totalRigid += comp.percentage;
                }
            });
            const defaultRigid = totalPercentage > 0 ? (totalRigid / totalPercentage) * 100 : 0;
            setReturnRigidPercentage(Math.round(defaultRigid * 10) / 10);
        }
    }, [batch]);

    const handleRecordOutput = () => {
        if (!outputQuantity || parseFloat(outputQuantity) <= 0) return;

        const rigidPercentage = returnRigidPercentage;
        const nonRigidPercentage = 100 - rigidPercentage;

        let creditEligible = outputType === 'FINAL_PRODUCT';
        const rigidKg = creditEligible ? parseFloat(outputQuantity) * (rigidPercentage / 100) : 0;
        const nonRigidKg = creditEligible ? parseFloat(outputQuantity) * (nonRigidPercentage / 100) : 0;

        const newOutput = {
            id: `OUT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            type: outputType as any,
            quantityKg: parseFloat(outputQuantity),
            creditEligible,
            rigidKg,
            nonRigidKg,
            recordedAt: new Date(),
            recordedBy: 'Supervisor User'
        };

        const updatedBatch = { ...batch! };
        updatedBatch.outputs = [...(updatedBatch.outputs || []), newOutput];
        setBatch(updatedBatch);

        setShowOutputDialog(false);
        setOutputQuantity('');
        setOutputNotes('');
    };

    const handleReturnMaterial = () => {
        if (!returnQuantity || parseFloat(returnQuantity) <= 0 || !destinationWarehouse) {
            return;
        }

        const newReturned = {
            quantityKg: parseFloat(returnQuantity),
            rigidPercentage: returnRigidPercentage,
            nonRigidPercentage: 100 - returnRigidPercentage,
            returnedAt: new Date(),
            returnedBy: 'Supervisor User',
            destinationWarehouse,
            sourceBatchId: batch!.id,
            newMaterialCode: `MAT-RET-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        };

        setReturnedMaterials([...returnedMaterials, newReturned]);

        const updatedBatch = { ...batch! };
        updatedBatch.quantities.returned = (updatedBatch.quantities.returned || 0) + newReturned.quantityKg;
        setBatch(updatedBatch);

        setShowReturnDialog(false);
        setReturnQuantity('');
        setDestinationWarehouse('');
    };

    useEffect(() => {
        const loadBatchData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const initialBatchData = await batchService.getBatchById(id);

                if (initialBatchData) {
                    await checkBatchOverdueStatus([initialBatchData]);
                    const batchData = await batchService.getBatchById(id);
                    setBatch(batchData);

                    // Load linked measurements
                    const allMeasurements = await measurementService.getMeasurements({ batchId: id });
                    setMeasurements(allMeasurements);
                }
            } catch (error) {
                console.error('Error loading batch:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBatchData();
    }, [id]);

    const handleApproveDelay = async () => {
        if (!batch || !approvalReason.trim() || !user) return;

        try {
            await batchService.updateBatchStatus(batch.id, 'APPROVED_OVERDUE', user.name);
            await batchService.updateBatch(batch.id, {
                overdueApproval: {
                    ...batch.overdueApproval!,
                    approvedAt: new Date(),
                    approvedBy: user.name,
                    reason: approvalReason,
                }
            }, user.name);

            const updated = await batchService.getBatchById(batch.id);
            setBatch(updated);
            setShowApprovalDialog(false);
            setApprovalReason('');
        } catch (err) {
            console.error('Error approving delay:', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!batch) {
        return (
            <Box>
                <Alert severity="error">
                    Batch not found
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/batches')}
                    sx={{ mt: 2 }}
                >
                    Back to Batches
                </Button>
            </Box>
        );
    }

    const efficiency = batchService.calculateEfficiency(batch);
    const recycledContent = batchService.getRecycledContentPercentage(batch);
    const progress = batch.quantities.expected > 0
        ? (batch.quantities.consumed / batch.quantities.expected) * 100
        : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'info';
            case 'IN_PROGRESS': return 'primary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'OVERDUE_PENDING_APPROVAL': return 'error';
            case 'APPROVED_OVERDUE': return 'warning';
            default: return 'default';
        }
    };

    const breakdown = calculateBatchCreditEligibleInput(batch);
    const riskAssessment = assessCreditsAtRisk(batch, measurements, discrepancies);

    // Evidence Package Calculations
    const measurementsWithEvidence = measurements.filter(m => m.evidenceLinks && m.evidenceLinks.length > 0).length;
    const evidenceCompleteness = measurements.length > 0 ? (measurementsWithEvidence / measurements.length) * 100 : 0;

    const handleGeneratePackage = () => {
        if (batch.id === 'BATCH-2026-001') {
            return mockEvidencePackage;
        }
        return evidencePackageService.buildEvidencePackage(batch, measurements, discrepancies);
    };

    const getMaterialIcon = (classification: string) => {
        switch (classification) {
            case 'RECYCLED': return <Recycling color="success" fontSize="small" />;
            case 'VIRGIN': return <Science color="action" fontSize="small" />;
            case 'MIXED': return <Grass color="warning" fontSize="small" />;
            default: return null;
        }
    };

    return (
        <Box>
            {batch.status === 'OVERDUE_PENDING_APPROVAL' && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        user?.role === 'admin' && (
                            <Button color="inherit" size="small" onClick={() => setShowApprovalDialog(true)}>
                                Approve Delay
                            </Button>
                        )
                    }
                >
                    <strong>Overdue Approval Required:</strong> This batch has been open for {batchService.getBatchDaysOpen(batch)} days without closure. {user?.role !== 'admin' && 'Supervisor approval required before continuing.'}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Button
                        variant="text"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/batches')}
                        sx={{ mb: 1 }}
                    >
                        Back to Batches
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        {batch.productName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Batch ID: {batch.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>|</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vehicle: <strong>{batch.vehicleId}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>|</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Source: <strong>{batch.source}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>|</Typography>
                        <Chip
                            label={batch.status.replace('_', ' ')}
                            color={getStatusColor(batch.status) as any}
                            size="small"
                        />
                        <Chip
                            label={batch.productType}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title={batch.status === 'OVERDUE_PENDING_APPROVAL' ? "Supervisor approval required before continuing" : ""}>
                        <span>
                            <Button variant="outlined" disabled={batch.status === 'OVERDUE_PENDING_APPROVAL'}>Record Output</Button>
                        </span>
                    </Tooltip>
                    <Tooltip title={batch.status === 'OVERDUE_PENDING_APPROVAL' ? "Supervisor approval required before continuing" : ""}>
                        <span>
                            <Button variant="contained" color="success" disabled={batch.status === 'OVERDUE_PENDING_APPROVAL'}>Close Batch</Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {/* Key Metrics Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
                <Box>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Recycling color="success" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Recycled Content
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color={recycledContent >= 50 ? 'success.main' : 'text.primary'}>
                                {recycledContent.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrendingUp color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Yield Efficiency
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {efficiency.yieldPercentage.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DeleteIcon color="error" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Waste
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {efficiency.wastePercentage.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Schedule color="action" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Progress
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {progress.toFixed(0)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Left Column */}
                <Box>
                    {/* Material Composition */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Material Composition
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Rigidity</TableCell>
                                        <TableCell align="right">Percentage</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {batch.composition.map((material, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{material.materialTypeName}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {material.materialTypeCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {getMaterialIcon(material.classification)}
                                                    <Typography variant="body2">
                                                        {material.classification}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={material.rigidity ? material.rigidity.replace('_', '-') : 'N/A'}
                                                    size="small"
                                                    color={material.rigidity === 'RIGID' ? 'primary' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="bold">
                                                    {material.percentage.toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Quantities Tracking */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Quantity Tracking & Outputs
                            </Typography>
                            <Button variant="contained" size="small" onClick={() => setShowOutputDialog(true)}>
                                Record Output
                            </Button>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Expected</Typography>
                                <Typography variant="h6">{batch.quantities.expected.toFixed(2)} kg</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Received</Typography>
                                <Typography variant="h6">{batch.quantities.received.toFixed(2)} kg</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Consumed</Typography>
                                <Typography variant="h6">{batch.quantities.consumed.toFixed(2)} kg</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Returned</Typography>
                                <Typography variant="h6" color="info.main">{batch.quantities.returned?.toFixed(2) || '0.00'} kg</Typography>
                            </Box>
                        </Box>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Recorded Outputs</Typography>
                        <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Qty (kg)</TableCell>
                                        <TableCell align="center">Eligible</TableCell>
                                        <TableCell align="right">Rigid / Non-Rigid</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!batch.outputs || batch.outputs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                                                No outputs recorded yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        batch.outputs.map((out, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{new Date(out.recordedAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Chip label={out.type.replace('_', ' ')} size="small" color={out.type === 'FINAL_PRODUCT' ? 'success' : out.type === 'WASTE' ? 'error' : 'default'} />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{out.quantityKg.toFixed(2)}</TableCell>
                                                <TableCell align="center">
                                                    {out.creditEligible ? <CheckCircle color="success" fontSize="small" /> : '-'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {out.creditEligible ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            <Typography variant="caption" color="primary">{out.rigidKg.toFixed(1)}</Typography> /
                                                            <Typography variant="caption" color="secondary">{out.nonRigidKg.toFixed(1)}</Typography>
                                                        </Box>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
                                <strong>Mass Balance:</strong> &nbsp; Yielded + Waste + Returned = Consumed
                            </Typography>
                            {batchService.calculateEfficiency(batch).isMassBalanceValid ? (
                                <Chip size="small" label="Valid" color="success" variant="outlined" />
                            ) : (
                                <Chip size="small" label="Discrepancy" color="warning" variant="outlined" />
                            )}
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Consumption Progress
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {progress.toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(progress, 100)}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    </Paper>

                    {/* Return to Warehouse Section */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Return to Warehouse
                            </Typography>
                            <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                onClick={() => setShowReturnDialog(true)}
                            >
                                Return Material
                            </Button>
                        </Box>

                        {returnedMaterials.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No materials returned to warehouse from this batch.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Warehouse</TableCell>
                                            <TableCell>New Code</TableCell>
                                            <TableCell align="right">Qty (kg)</TableCell>
                                            <TableCell align="right">Rigid %</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {returnedMaterials.map((ret, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{new Date(ret.returnedAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{ret.destinationWarehouse}</TableCell>
                                                <TableCell>
                                                    <Chip label={ret.newMaterialCode} size="small" color="info" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {ret.quantityKg}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">{ret.rigidPercentage}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    {/* Linked Measurements */}
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Linked Measurements
                            </Typography>
                            <Chip
                                label={`${measurements.length} measurements`}
                                size="small"
                                icon={<Assessment />}
                            />
                        </Box>

                        {measurements.length === 0 ? (
                            <Alert severity="info">
                                No measurements linked to this batch yet
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Process Step</TableCell>
                                            <TableCell>Material</TableCell>
                                            <TableCell align="right">Value</TableCell>
                                            <TableCell>Source</TableCell>
                                            <TableCell>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {measurements.slice(0, 10).map((measurement) => (
                                            <TableRow key={measurement.id}>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {measurement.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{measurement.location.processStep.split(' - ')[0]}</TableCell>
                                                <TableCell>{measurement.materialTypeCode}</TableCell>
                                                <TableCell align="right">
                                                    {measurement.value.toFixed(2)} {measurement.unit}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={measurement.source}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(measurement.timestamp).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {measurements.length > 10 && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Showing 10 of {measurements.length} measurements
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Right Column */}
                <Box>
                    {/* Credit Eligible Summary */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Credit Eligible Summary
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Total Eligible Input</Typography>
                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                                {breakdown.totalEligibleKg.toFixed(2)} kg
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="info.main" fontWeight="bold">
                                    Rigid ({breakdown.rigidPercentage.toFixed(1)}%)
                                </Typography>
                                <Typography variant="h6">
                                    {breakdown.rigidKg.toFixed(2)} kg
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="secondary.main" fontWeight="bold">
                                    Non-Rigid ({breakdown.nonRigidPercentage.toFixed(1)}%)
                                </Typography>
                                <Typography variant="h6">
                                    {breakdown.nonRigidKg.toFixed(2)} kg
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Batch Information */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Batch Information
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Start Date</Typography>
                            <Typography variant="body1">
                                {new Date(batch.startDate).toLocaleDateString()}
                            </Typography>
                        </Box>

                        {batch.completionDate && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Completion Date</Typography>
                                <Typography variant="body1">
                                    {new Date(batch.completionDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                        )}

                        {batch.metadata.supplier && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Supplier</Typography>
                                <Typography variant="body1">{batch.metadata.supplier}</Typography>
                            </Box>
                        )}

                        {batch.metadata.lotNumber && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Lot Number</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                    {batch.metadata.lotNumber}
                                </Typography>
                            </Box>
                        )}

                        {batch.metadata.qualityGrade && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Quality Grade</Typography>
                                <Typography variant="body1">{batch.metadata.qualityGrade}</Typography>
                            </Box>
                        )}

                        {batch.notes && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Notes</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {batch.notes}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Audit Trail */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Audit Trail
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Created</Typography>
                            <Typography variant="body2">
                                {new Date(batch.audit.createdAt).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                by {batch.audit.createdBy}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Last Modified</Typography>
                            <Typography variant="body2">
                                {new Date(batch.audit.lastModifiedAt).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                by {batch.audit.lastModifiedBy}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Version</Typography>
                            <Typography variant="body2">{batch.audit.version}</Typography>
                        </Box>
                    </Paper>

                    {/* Evidence Package Section */}
                    {(user?.role === 'supervisor' || user?.role === 'auditor') && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Evidence Package
                                </Typography>
                                <Chip
                                    label={`${evidenceCompleteness.toFixed(0)}% Complete`}
                                    color={evidenceCompleteness >= 80 ? 'success' : 'warning'}
                                    size="small"
                                />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Compile all documentation, measurements, and evidence for {batch.id} into a structured package for certification.
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={evidenceCompleteness}
                                    color={evidenceCompleteness >= 80 ? 'success' : 'warning'}
                                    sx={{ height: 8, borderRadius: 4, mb: 1, mt: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {measurementsWithEvidence} / {measurements.length} measurements have evidence attached.
                                </Typography>
                            </Box>

                            {evidenceCompleteness < 80 && (
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    Package may be insufficient for certification. Add more evidence to measurements.
                                </Alert>
                            )}

                            <Box sx={{ display: 'grid', gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={() => setShowPreviewModal(true)}
                                    fullWidth
                                >
                                    Preview Package
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="info"
                                    startIcon={<Code />}
                                    onClick={() => evidencePackageService.exportAsJSON(handleGeneratePackage() as any)}
                                    fullWidth
                                >
                                    Export as JSON
                                </Button>
                                <Button
                                    variant="contained"
                                    color="info"
                                    startIcon={<PictureAsPdf />}
                                    onClick={() => evidencePackageService.exportAsPDF(handleGeneratePackage() as any)}
                                    fullWidth
                                >
                                    Export as PDF
                                </Button>
                            </Box>
                        </Paper>
                    )}
                </Box>
            </Box>



            {/* Return Material Dialog */}
            <Dialog open={showReturnDialog} onClose={() => setShowReturnDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Return Material to Warehouse</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 3, mt: 1 }}>
                        <TextField
                            label="Quantity (kg)"
                            type="number"
                            fullWidth
                            value={returnQuantity}
                            onChange={(e) => setReturnQuantity(e.target.value)}
                            required
                        />
                        <TextField
                            label="Destination Warehouse"
                            fullWidth
                            placeholder="e.g., Warehouse South"
                            value={destinationWarehouse}
                            onChange={(e) => setDestinationWarehouse(e.target.value)}
                            required
                        />
                        <TextField
                            label="Rigid Percentage (%)"
                            type="number"
                            fullWidth
                            helperText="Calculated from initial composition but can be adjusted"
                            value={returnRigidPercentage}
                            onChange={(e) => setReturnRigidPercentage(parseFloat(e.target.value) || 0)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowReturnDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleReturnMaterial}
                        disabled={!returnQuantity || parseFloat(returnQuantity) <= 0 || !destinationWarehouse}
                    >
                        Confirm Return
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Delay Dialog */}
            <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Batch Delay</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
                        This batch has been open for {batchService.getBatchDaysOpen(batch)} days. Please provide a reason for the delay to unlock it for operators.
                    </Alert>
                    <Box sx={{ display: 'grid', gap: 3 }}>
                        <TextField
                            label="Supervisor Name"
                            fullWidth
                            value={user?.name || ''}
                            disabled
                        />
                        <TextField
                            label="Reason for Delay"
                            multiline
                            rows={3}
                            fullWidth
                            value={approvalReason}
                            onChange={(e) => setApprovalReason(e.target.value)}
                            required
                            placeholder="e.g., Waiting on lab results for quality check"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleApproveDelay}
                        disabled={!approvalReason.trim()}
                    >
                        Confirm Approval
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Package Modal */}
            <Dialog open={showPreviewModal} onClose={() => setShowPreviewModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Evidence Package Preview</Typography>
                    <Chip label={handleGeneratePackage().packageId} size="small" variant="outlined" />
                </DialogTitle>
                <DialogContent dividers>
                    {(() => {
                        const pkg = handleGeneratePackage() as any;
                        return (
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Alert severity="info" icon={false}>
                                    <Typography variant="subtitle2">Generated: {new Date(pkg.generatedAt).toLocaleString()}</Typography>
                                    <Typography variant="subtitle2">By: {pkg.generatedBy}</Typography>
                                </Alert>

                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography fontWeight="bold">Batch & Material Information</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Product</Typography>
                                                <Typography variant="body2">{pkg.batch.productName}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Source / Supplier</Typography>
                                                <Typography variant="body2">{pkg.batch.source} / {pkg.batch.supplier}</Typography>
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography fontWeight="bold">Mass Balance ({pkg.massBalance.status})</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Total Input / Output</Typography>
                                                <Typography variant="body2">{pkg.quantities.totalInputKg} kg / {pkg.quantities.finalOutputKg} kg</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Delta</Typography>
                                                <Typography variant="body2" color={pkg.massBalance.status === 'OK' ? 'success.main' : 'error.main'}>
                                                    {pkg.massBalance.delta > 0 ? '+' : ''}{pkg.massBalance.delta} kg
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography fontWeight="bold">Measurements & Evidence ({pkg.measurements.length})</Typography>
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
                                                {pkg.measurements.map((m: any) => (
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
                        );
                    })()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
                    <Button variant="contained" color="info" onClick={() => {
                        setShowPreviewModal(false);
                        evidencePackageService.exportAsPDF(handleGeneratePackage() as any);
                    }}>
                        Export PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BatchDetail;
