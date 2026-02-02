import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const processSteps = [
    'Material Receipt - Ready for Production',
    'Material Receipt - Requires Cleaning',
    'Before Mixing',
    'After Extrusion',
    'After Unification',
    'Finished Goods',
    'Waste/Loss',
];

const MeasurementCapture: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        processStep: processSteps[0],
        value: '',
        unit: 'kg',
        materialType: 'RECYCLED',
        materialCode: '',
        batchId: 'BATCH-2026-001',
        notes: '',
    });

    const handleSubmit = () => {
        alert(`Measurement captured successfully!\n\n${JSON.stringify(formData, null, 2)}`);
        navigate('/measurements');
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Capture Measurement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Record a new measurement at production station
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Stepper activeStep={0} sx={{ mb: 4 }}>
                    <Step>
                        <StepLabel>Select Process Step</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Enter Measurement</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Review & Submit</StepLabel>
                    </Step>
                </Stepper>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Process Step</InputLabel>
                        <Select
                            value={formData.processStep}
                            label="Process Step"
                            onChange={(e) => setFormData({ ...formData, processStep: e.target.value })}
                        >
                            {processSteps.map((step) => (
                                <MenuItem key={step} value={step}>{step}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Batch ID</InputLabel>
                        <Select
                            value={formData.batchId}
                            label="Batch ID"
                            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                        >
                            <MenuItem value="BATCH-2026-001">BATCH-2026-001</MenuItem>
                            <MenuItem value="BATCH-2026-002">BATCH-2026-002</MenuItem>
                            <MenuItem value="BATCH-2026-003">BATCH-2026-003</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Measurement Value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter value"
                    />

                    <FormControl fullWidth>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={formData.unit}
                            label="Unit"
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <MenuItem value="kg">Kilograms (kg)</MenuItem>
                            <MenuItem value="lbs">Pounds (lbs)</MenuItem>
                            <MenuItem value="ton">Tons</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Material Type</InputLabel>
                        <Select
                            value={formData.materialType}
                            label="Material Type"
                            onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                        >
                            <MenuItem value="RECYCLED">Recycled</MenuItem>
                            <MenuItem value="VIRGIN">Virgin</MenuItem>
                            <MenuItem value="MIXED">Mixed</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Material Code"
                        value={formData.materialCode}
                        onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                        placeholder="e.g., MAT-001"
                        sx={{ gridColumn: '1 / -1' }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notes (Optional)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any relevant notes..."
                        sx={{ gridColumn: '1 / -1' }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSubmit}
                        disabled={!formData.value}
                    >
                        Save Measurement
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => navigate('/measurements')}
                    >
                        Cancel
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default MeasurementCapture;
