import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add, Visibility, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { batchService, BatchRecord, BatchStatus } from '../services/batchService';

const Batches: React.FC = () => {
    const [batches, setBatches] = useState<BatchRecord[]>([]);
    const [filteredBatches, setFilteredBatches] = useState<BatchRecord[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBatches();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [batches, statusFilter]);

    const loadBatches = async () => {
        try {
            const data = await batchService.getBatches();
            setBatches(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading batches:', error);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...batches];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        setFilteredBatches(filtered);
    };

    const getStatusColor = (status: BatchStatus) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'primary';
            case 'RECEIVED': return 'info';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const getMaterialIcon = (classification: string) => {
        switch (classification) {
            case 'RECYCLED': return <CheckCircle fontSize="small" color="success" />;
            case 'VIRGIN': return <ErrorIcon fontSize="small" color="disabled" />;
            case 'MIXED': return <Warning fontSize="small" color="warning" />;
            default: return null;
        }
    };

    const calculateProgress = (batch: BatchRecord): number => {
        const { expected, consumed } = batch.quantities;
        if (expected === 0) return 0;
        return Math.min((consumed / expected) * 100, 100);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <div>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Batch Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track production batches and material lineage
                    </Typography>
                </div>
                <Button
                    component={Link}
                    to="/batches/create"
                    variant="contained"
                    startIcon={<Add />}
                    size="large"
                >
                    New Batch
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status Filter"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="RECEIVED">Received</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Showing <strong>{filteredBatches.length}</strong> of <strong>{batches.length}</strong> batches
                </Typography>
            </Paper>

            {/* Batch Cards Grid */}
            {loading ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Loading batches...
                    </Typography>
                </Box>
            ) : filteredBatches.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No batches found
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
                    {filteredBatches.map((batch) => {
                        const recycledPercentage = batchService.getRecycledContentPercentage(batch);
                        const efficiency = batchService.calculateEfficiency(batch);
                        const progress = calculateProgress(batch);

                        return (
                            <Card key={batch.id} elevation={2}>
                                <CardContent>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" fontFamily="monospace">
                                            {batch.id}
                                        </Typography>
                                        <Chip
                                            label={batch.status.replace('_', ' ')}
                                            size="small"
                                            color={getStatusColor(batch.status)}
                                        />
                                    </Box>

                                    {/* Product Info */}
                                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                                        {batch.productName}
                                    </Typography>
                                    <Chip
                                        label={batch.productType}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mb: 2 }}
                                    />

                                    {/* Material Composition */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Material Composition
                                        </Typography>
                                        {batch.composition.map((comp, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                {getMaterialIcon(comp.classification)}
                                                <Typography variant="caption">
                                                    {comp.materialTypeName} ({comp.percentage}%)
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>

                                    {/* Recycled Content Highlight */}
                                    <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: recycledPercentage >= 50 ? 'success.50' : 'grey.50' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Recycled Content
                                        </Typography>
                                        <Typography variant="h6" color={recycledPercentage >= 50 ? 'success.main' : 'text.primary'} fontWeight="bold">
                                            {recycledPercentage}%
                                        </Typography>
                                    </Paper>

                                    {/* Progress */}
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        Progress: <strong>{batch.quantities.consumed} / {batch.quantities.expected} {batch.quantities.unit}</strong>
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{ mb: 2, height: 8, borderRadius: 1 }}
                                    />

                                    {/* Efficiency Stats (for completed or in-progress batches) */}
                                    {batch.status !== 'RECEIVED' && batch.quantities.yielded > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Yield: {efficiency.yieldPercentage}% | Waste: {efficiency.wastePercentage}%
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Metadata */}
                                    {batch.metadata.supplier && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Supplier: {batch.metadata.supplier}
                                        </Typography>
                                    )}
                                    {batch.metadata.lotNumber && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Lot: {batch.metadata.lotNumber}
                                        </Typography>
                                    )}

                                    {/* Date Info */}
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                        Started: {batch.startDate.toLocaleDateString()}
                                    </Typography>
                                    {batch.completionDate && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Completed: {batch.completionDate.toLocaleDateString()}
                                        </Typography>
                                    )}

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button
                                            component={Link}
                                            to={`/batches/${batch.id}`}
                                            size="small"
                                            variant="outlined"
                                            fullWidth
                                            startIcon={<Visibility />}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default Batches;
