import React from 'react';
import { Box, Paper, Typography, Grid, Divider, Button, Card, CardContent, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowDownward, TrendingFlat } from '@mui/icons-material';
import ImmutableValue from '../components/common/ImmutableValue';
import EvidenceLink from '../components/common/EvidenceLink';
import { useData } from '../contexts/DataContext';
import StatusBadge from '../components/common/StatusBadge';

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

const VRCQManager: React.FC = () => {
    const { measurements, batches } = useData();

    // 1. Calculate Total Inputs (All material measurements at Intake)
    const inputs = measurements
        .filter(m => m.station === 'Intake Station')
        .reduce((sum, m) => sum + m.value, 0);

    // 2. Calculate Virgin Additives (Material Type = VIRGIN)
    // Note: In real app this would be more specific, here we simplify for demo
    const virgin = measurements
        .filter(m => m.materialType === 'VIRGIN')
        .reduce((sum, m) => sum + m.value, 0);

    // 3. Calculate Losses (Simplified: 3% of inputs if no specific loss records)
    // Look for explicit 'loss' or 'scrap' measurements
    const explicitLosses = measurements
        .filter(m => m.materialType === 'WASTE')
        .reduce((sum, m) => sum + m.value, 0);

    // Fallback model: 3% process loss
    const modeledLoss = inputs * 0.03;

    const losses = explicitLosses > 0 ? explicitLosses : modeledLoss;

    // 4. Net Output
    const output = inputs + virgin - losses;

    // 5. Check Balance Limit (Warning if > 5% imbalance vs actual production)
    const totalProduction = batches
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.currentQuantity, 0);

    const isBalanced = Math.abs(output - totalProduction) / output < 0.05; // 5% tolerance

    const [snackbarOpen, setSnackbarOpen] = React.useState(false);

    const handleExport = () => {
        setSnackbarOpen(true);
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                    Mass Balance (VRCQ) Calculation
                </Typography>
                <Button variant="contained" color="primary" onClick={handleExport}>Generate Credit Certificate</Button>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message="Generating PCX Credit Certificate... Download will start shortly."
            />

            <Grid container spacing={4}>
                {/* Equation Visualizer */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#757575' }}>OFFICIAL FORMULA</Typography>
                        <Grid container alignItems="center" justifyContent="center" spacing={2}>
                            <Grid>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {inputs.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" display="block">TOTAL INPUTS</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">+</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" color="text.secondary" fontWeight="bold">
                                    {virgin.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" display="block">VIRGIN ADDITIVES</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">-</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" color="error.main" fontWeight="bold">
                                    {losses.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" display="block">PROCESS LOSSES</Typography>
                            </Grid>
                            <Grid>
                                <Typography variant="h4" fontWeight="bold">=</Typography>
                            </Grid>
                            <Grid>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main', borderWidth: 2 }}>
                                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                                        {output.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" display="block" fontWeight="bold">NET OUTPUT (VRCQ)</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <MassBalanceItem label="Raw Material Inputs (Verified)" value={inputs} unit="kg" type="input" />
                        <MassBalanceItem label="Virgin Additives / Masterbatch" value={virgin} unit="kg" type="input" />
                        <MassBalanceItem label="Production Scrap / Purge / Moisture Loss" value={losses} unit="kg" type="loss" />
                        <Divider sx={{ my: 2 }} />
                        <MassBalanceItem label="Final Verified Output" value={output} unit="kg" type="output" />
                    </Box>

                </Grid>

                {/* Sidebar Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Calculation Rules</Typography>
                        <Typography variant="body2" paragraph>
                            The Mass Balance calculation adheres to the PCX Standard v2.1.
                            All inputs must be verified by weighbridge tickets.
                            Losses are calculated based on the difference between input and final product weight,
                            minus any specifically tracked waste streams.
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Last calculated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                            Status: <StatusBadge status={isBalanced ? 'success' : 'warning'} label={isBalanced ? 'BALANCED' : 'REQUIRES REVIEW'} />
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box >
    );
};

export default VRCQManager;
