import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from '@mui/material';
import { Add, Visibility, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { measurementService, MeasurementRecord } from '../services/measurementService';

const Measurements: React.FC = () => {
    const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
    const [filteredMeasurements, setFilteredMeasurements] = useState<MeasurementRecord[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMeasurements();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [measurements, statusFilter, sourceFilter, searchQuery]);

    const loadMeasurements = async () => {
        try {
            const data = await measurementService.getMeasurements();
            setMeasurements(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading measurements:', error);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...measurements];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(m =>
                m.validationStatus.toLowerCase() === statusFilter
            );
        }

        // Source filter
        if (sourceFilter !== 'all') {
            filtered = filtered.filter(m =>
                m.source === sourceFilter
            );
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.batchId?.toLowerCase().includes(query) ||
                m.materialTypeCode.toLowerCase().includes(query) ||
                m.location.stationName.toLowerCase().includes(query) ||
                m.location.processStep.toLowerCase().includes(query)
            );
        }

        setFilteredMeasurements(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALIDATED': return 'success';
            case 'PENDING': return 'warning';
            case 'FLAGGED': return 'error';
            default: return 'default';
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
            case 'RECYCLED': return <CheckCircle fontSize="small" color="success" />;
            case 'VIRGIN': return <ErrorIcon fontSize="small" color="disabled" />;
            case 'MIXED': return <Warning fontSize="small" color="warning" />;
            default: return null;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <div>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Measurements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage all measurement records
                    </Typography>
                </div>
                <Button
                    component={Link}
                    to="/measurements/capture"
                    variant="contained"
                    startIcon={<Add />}
                    size="large"
                >
                    New Measurement
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
                            <MenuItem value="validated">Validated</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="flagged">Flagged</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Source Filter</InputLabel>
                        <Select
                            value={sourceFilter}
                            label="Source Filter"
                            onChange={(e) => setSourceFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Sources</MenuItem>
                            <MenuItem value="MES">MES</MenuItem>
                            <MenuItem value="SCALE">Scale</MenuItem>
                            <MenuItem value="MANUAL">Manual</MenuItem>
                            <MenuItem value="DOCUMENT_SCAN">Document Scan</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        size="small"
                        label="Search"
                        placeholder="Batch, material, station..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Showing <strong>{filteredMeasurements.length}</strong> of <strong>{measurements.length}</strong> measurements
                </Typography>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Timestamp</strong></TableCell>
                            <TableCell><strong>Source</strong></TableCell>
                            <TableCell><strong>Station</strong></TableCell>
                            <TableCell><strong>Process Step</strong></TableCell>
                            <TableCell><strong>Value</strong></TableCell>
                            <TableCell><strong>Material</strong></TableCell>
                            <TableCell><strong>Batch</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    Loading measurements...
                                </TableCell>
                            </TableRow>
                        ) : filteredMeasurements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No measurements found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMeasurements.map((m) => (
                                <TableRow key={m.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {m.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {m.timestamp.toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {m.timestamp.toLocaleTimeString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={m.source}
                                            size="small"
                                            color={getSourceColor(m.source)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {m.location.stationName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 150 }} noWrap>
                                            {m.location.processStep}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {m.value} {m.unit}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {getMaterialIcon(m.materialClassification)}
                                            <Typography variant="caption">
                                                {m.materialClassification}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {m.materialTypeCode}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {m.batchId || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={m.validationStatus}
                                            size="small"
                                            color={getStatusColor(m.validationStatus)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            disabled
                                            title="Detail view coming soon"
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Measurements;
