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
} from '@mui/icons-material';
import { batchService, BatchRecord } from '../services/batchService';
import { measurementService } from '../services/measurementService';

const BatchDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [batch, setBatch] = useState<BatchRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [measurements, setMeasurements] = useState<any[]>([]);

    useEffect(() => {
        const loadBatchData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const batchData = await batchService.getBatchById(id);

                if (batchData) {
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
            case 'IN_PROGRESS': return 'warning';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
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
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Quantity Tracking
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
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
                                <Typography variant="caption" color="text.secondary">Yielded</Typography>
                                <Typography variant="h6">{batch.quantities.yielded.toFixed(2)} kg</Typography>
                            </Box>
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
                </Box>
            </Box>
        </Box>
    );
};

export default BatchDetail;
