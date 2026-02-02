import React, { useState } from 'react';
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
    Grid,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { mockMeasurements } from '../mockData';

const Measurements: React.FC = () => {
    const [filter, setFilter] = useState('all');

    const filteredMeasurements = filter === 'all'
        ? mockMeasurements
        : mockMeasurements.filter(m => m.status.toLowerCase() === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'FLAGGED': return 'error';
            default: return 'default';
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
                >
                    New Measurement
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                                value={filter}
                                label="Status Filter"
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            placeholder="Search by batch, material..."
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredMeasurements.length} of {mockMeasurements.length} measurements
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Timestamp</strong></TableCell>
                            <TableCell><strong>Station</strong></TableCell>
                            <TableCell><strong>Process Step</strong></TableCell>
                            <TableCell><strong>Value</strong></TableCell>
                            <TableCell><strong>Material</strong></TableCell>
                            <TableCell><strong>Batch</strong></TableCell>
                            <TableCell><strong>Operator</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMeasurements.map((m) => (
                            <TableRow key={m.id} hover>
                                <TableCell>{m.timestamp.toLocaleString()}</TableCell>
                                <TableCell>{m.station}</TableCell>
                                <TableCell>{m.processStep}</TableCell>
                                <TableCell>{m.value} {m.unit}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={m.materialType}
                                        size="small"
                                        color={m.materialType === 'RECYCLED' ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{m.batchId}</TableCell>
                                <TableCell>{m.operator}</TableCell>
                                <TableCell>
                                    <Chip label={m.status} size="small" color={getStatusColor(m.status)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Measurements;
