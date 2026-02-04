import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Card,
    CardContent,
    Divider,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Recycling,
    Science,
    Grass,
    AttachFile,
} from '@mui/icons-material';
import { measurementService, MeasurementRecord } from '../services/measurementService';
import { batchService } from '../services/batchService';

const MeasurementDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [measurement, setMeasurement] = useState<MeasurementRecord | null>(null);
    const [batchInfo, setBatchInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMeasurementData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const measurementData = await measurementService.getMeasurementById(id);

                if (measurementData) {
                    setMeasurement(measurementData);

                    // Load batch info if linked
                    if (measurementData.batchId) {
                        const batch = await batchService.getBatchById(measurementData.batchId);
                        setBatchInfo(batch);
                    }
                }
            } catch (error) {
                console.error('Error loading measurement:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMeasurementData();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!measurement) {
        return (
            <Box>
                <Alert severity="error">
                    Measurement not found
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/measurements')}
                    sx={{ mt: 2 }}
                >
                    Back to Measurements
                </Button>
            </Box>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALIDATED': return 'success';
            case 'PENDING': return 'warning';
            case 'FLAGGED': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VALIDATED': return <CheckCircle color="success" />;
            case 'PENDING': return <Warning color="warning" />;
            case 'FLAGGED': return <ErrorIcon color="error" />;
            default: return undefined;
        }
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'MES': return 'primary';
            case 'SCALE': return 'success';
            case 'MANUAL': return 'warning';
            case 'DOCUMENT_SCAN': return 'info';
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
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/measurements')}
                    sx={{ mb: 1 }}
                >
                    Back to Measurements
                </Button>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Measurement Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        ID: {measurement.id}
                    </Typography>
                    <Chip
                        icon={getStatusIcon(measurement.validationStatus)}
                        label={measurement.validationStatus}
                        color={getStatusColor(measurement.validationStatus) as any}
                        size="small"
                    />
                    <Chip
                        label={measurement.source}
                        color={getSourceColor(measurement.source) as any}
                        size="small"
                    />
                </Box>
            </Box>

            {/* Manual entry warning */}
            {measurement.source === 'MANUAL' && measurement.metadata.entryJustification && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>Manual Entry:</strong> This measurement was entered manually and requires verification.
                    <br />
                    <strong>Justification:</strong> {measurement.metadata.entryJustification}
                </Alert>
            )}

            {/* Flagged status alert */}
            {measurement.validationStatus === 'FLAGGED' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <strong>Flagged for Review:</strong> This measurement requires attention.
                </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Left Column */}
                <Box>
                    {/* Measurement Value Card */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Measured Value
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {measurement.value.toFixed(2)} {measurement.unit}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Location & Material Info */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Location & Material
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" sx={{ fontWeight: 'bold', width: '40%' }}>
                                        Process Step
                                    </TableCell>
                                    <TableCell>{measurement.location.processStep}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                                        Station
                                    </TableCell>
                                    <TableCell>
                                        {measurement.location.stationName}
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            ({measurement.location.stationId})
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                                        Material Type
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getMaterialIcon(measurement.materialClassification)}
                                            <div>
                                                <Typography variant="body2">
                                                    {measurement.materialClassification}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Code: {measurement.materialTypeCode}
                                                </Typography>
                                            </div>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                {measurement.batchId && (
                                    <TableRow>
                                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                                            Linked Batch
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        color: 'primary.main',
                                                        cursor: 'pointer',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                    onClick={() => navigate(`/batches/${measurement.batchId}`)}
                                                >
                                                    {measurement.batchId}
                                                </Typography>
                                                {batchInfo && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {batchInfo.productName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>

                    {/* Operator & Timestamp */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Recording Information
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                            <Typography variant="body1">
                                {new Date(measurement.timestamp).toLocaleString()}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Recorded By</Typography>
                            <Typography variant="body1">
                                {measurement.operatorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {measurement.operatorId}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Data Source</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip
                                    label={measurement.source}
                                    color={getSourceColor(measurement.source) as any}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Paper>

                    {/* Notes */}
                    {measurement.metadata.notes && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Notes
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                {measurement.metadata.notes}
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Right Column */}
                <Box>
                    {/* Evidence Section */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Evidence & Documentation
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {measurement.evidenceLinks && measurement.evidenceLinks.length > 0 ? (
                            <Box>
                                {measurement.evidenceLinks.map((evidence, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                    >
                                        <AttachFile fontSize="small" color="action" />
                                        {evidence.filename}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Alert severity="info">
                                No evidence documents attached to this measurement
                            </Alert>
                        )}
                    </Paper>

                    {/* Validation Info */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Validation Status
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip
                                    label={measurement.validationStatus}
                                    color={getStatusColor(measurement.validationStatus) as any}
                                />
                            </Box>
                        </Box>


                    </Paper>

                    {/* Audit Trail */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Audit Trail
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Record ID</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {measurement.id}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                            <Typography variant="body2">
                                {new Date(measurement.timestamp).toLocaleString()}
                            </Typography>
                        </Box>

                        {measurement.metadata.supersededBy && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Superseded By</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        color: 'primary.main',
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => navigate(`/measurements/${measurement.metadata.supersededBy}`)}
                                >
                                    {measurement.metadata.supersededBy}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default MeasurementDetail;
