/**
 * MaterialFlowView — visual mass-balance and material flow diagram.
 *
 * Accessible by plant_engineer, super_admin, and regulatory (read-only).
 * Displays a stepped process-flow chart (Raw Inputs → Extrusion → Final Product + Waste)
 * alongside a Transfer Points Summary table showing variances against tolerance thresholds.
 * Export to CSV and PDF are available (currently stubbed with an alert).
 */
import React, { useState } from 'react';

import {
    Box,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip
} from '@mui/material';
import {
    ArrowForward,
    ArrowDownward,
    FileDownload,
    PictureAsPdf,
    Recycling,
    Factory,
    Inventory
} from '@mui/icons-material';

const MaterialFlowView: React.FC = () => {
    const [period, setPeriod] = useState('dec-2025');

    const handleExport = (type: 'csv' | 'pdf') => {
        alert(`Exporting Material Flow as ${type.toUpperCase()}`);
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    Material Flow Visualization
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Reporting Period</InputLabel>
                        <Select
                            value={period}
                            label="Reporting Period"
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <MenuItem value="dec-2025">December 2025</MenuItem>
                            <MenuItem value="nov-2025">November 2025</MenuItem>
                            <MenuItem value="oct-2025">October 2025</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined" startIcon={<FileDownload />} onClick={() => handleExport('csv')}>
                        CSV
                    </Button>
                    <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => handleExport('pdf')}>
                        PDF
                    </Button>
                </Box>
            </Box>

            {/* Stepped Flow Visualization using MUI */}
            <Paper sx={{ p: 4, mb: 4, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>Process Flow: Mix A → Extrusion → Packaging</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 4 }}>
                    {/* Input */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Paper sx={{ p: 3, borderTop: '4px solid #1976d2', width: 200 }}>
                            <Inventory color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6">Raw Inputs</Typography>
                            <Typography variant="h4" color="primary">450 t</Typography>
                            <Chip label="100% PCR virgin" size="small" sx={{ mt: 1 }} />
                        </Paper>
                    </Box>

                    <ArrowForward sx={{ fontSize: 40, color: 'text.secondary' }} />

                    {/* Processing */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Paper sx={{ p: 3, borderTop: '4px solid #ed6c02', width: 200 }}>
                            <Factory color="warning" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6">Extrusion</Typography>
                            <Typography variant="h4" color="warning.main">435 t</Typography>
                            <Chip label="-15t process loss" size="small" color="error" variant="outlined" sx={{ mt: 1 }} />
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ArrowForward sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <ArrowDownward sx={{ fontSize: 40, color: 'text.secondary', mt: 1 }} />
                    </Box>

                    {/* Output */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Paper sx={{ p: 3, borderTop: '4px solid #2e7d32', width: 200 }}>
                            <Inventory sx={{ fontSize: 40, mb: 1, color: '#2e7d32' }} />
                            <Typography variant="h6">Final Product</Typography>
                            <Typography variant="h4" sx={{ color: '#2e7d32' }}>420 t</Typography>
                            <Chip label="Yield: 93.3%" size="small" color="success" sx={{ mt: 1 }} />
                        </Paper>
                    </Box>
                </Box>

                {/* Waste Stream (Branching down from process) */}
                <Box sx={{ display: 'flex', justifyContent: 'center', pr: '280px', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Paper sx={{ p: 2, borderTop: '4px solid #d32f2f', width: 160, bgcolor: '#ffebee' }}>
                            <Recycling color="error" sx={{ fontSize: 30, mb: 1 }} />
                            <Typography variant="body1" fontWeight="bold">Waste / Scrap</Typography>
                            <Typography variant="h5" color="error">15 t</Typography>
                        </Paper>
                    </Box>
                </Box>
            </Paper>

            {/* Summary Table */}
            <Typography variant="h6" gutterBottom>Transfer Points Summary</Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Transfer Point</TableCell>
                            <TableCell align="right">Input Mass (kg)</TableCell>
                            <TableCell align="right">Output Mass (kg)</TableCell>
                            <TableCell align="right">Variance (kg)</TableCell>
                            <TableCell align="right">Allowed Tolerance</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Silo A → Mixer 1</TableCell>
                            <TableCell align="right">150,000</TableCell>
                            <TableCell align="right">149,800</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>-200</TableCell>
                            <TableCell align="right">± 500 kg</TableCell>
                            <TableCell align="center"><Chip size="small" label="WITHIN LIMITS" color="success" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mixer 1 → Extruder Line B</TableCell>
                            <TableCell align="right">149,800</TableCell>
                            <TableCell align="right">145,000</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>-4,800</TableCell>
                            <TableCell align="right">± 2,000 kg</TableCell>
                            <TableCell align="center"><Chip size="small" label="EXCEEDS TOLERANCE" color="error" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Extruder Line B → Packaging</TableCell>
                            <TableCell align="right">145,000</TableCell>
                            <TableCell align="right">144,950</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>-50</TableCell>
                            <TableCell align="right">± 500 kg</TableCell>
                            <TableCell align="center"><Chip size="small" label="WITHIN LIMITS" color="success" /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MaterialFlowView;
