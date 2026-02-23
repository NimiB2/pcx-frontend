import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    IconButton,
    Divider,
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { batchService, CreateBatchInput, MaterialComposition, ProductType } from '../services/batchService';
import { mockReturnedMaterials } from '../mockData/index';
import { Chip } from '@mui/material';

/**
 * BatchCreate Component
 * 
 * Provides a form interface for users to register a new production batch.
 * It handles input validation, dynamic material composition rows, and
 * submission to the batch service.
 * 
 * @component
 */
const BatchCreate: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productName: '',
        productType: 'PELLETS' as ProductType,
        vehicleId: '',
        source: '',
        expectedQuantity: '',
        unit: 'kg' as 'kg' | 'lbs' | 'ton',
        startDate: new Date().toISOString().split('T')[0],
        supplier: '',
        lotNumber: '',
        qualityGrade: '',
        notes: '',
        sourceBatchId: '',
    });

    const [composition, setComposition] = useState<MaterialComposition[]>([
        {
            materialTypeCode: '',
            materialTypeName: '',
            classification: 'RECYCLED',
            rigidity: '' as Extract<MaterialComposition['rigidity'], string>,
            percentage: 0,
        },
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [returnedMaterialInfo, setReturnedMaterialInfo] = useState<any>(null);

    React.useEffect(() => {
        if (formData.source === 'WAREHOUSE' && formData.sourceBatchId) {
            const returned = mockReturnedMaterials.find(rm => rm.sourceBatchId === formData.sourceBatchId);
            if (returned) {
                setReturnedMaterialInfo(returned);
                // Auto-fill composition logic
                setComposition([{
                    materialTypeCode: returned.newMaterialCode,
                    materialTypeName: 'Returned Material',
                    classification: 'RECYCLED',
                    rigidity: returned.rigidPercentage >= 50 ? 'RIGID' : 'NON_RIGID',
                    percentage: 100,
                }]);
            } else {
                setReturnedMaterialInfo(null);
            }
        } else {
            setReturnedMaterialInfo(null);
        }
    }, [formData.source, formData.sourceBatchId]);

    const addCompositionRow = () => {
        setComposition([
            ...composition,
            {
                materialTypeCode: '',
                materialTypeName: '',
                classification: 'RECYCLED',
                rigidity: '' as Extract<MaterialComposition['rigidity'], string>,
                percentage: 0,
            },
        ]);
    };

    const removeCompositionRow = (index: number) => {
        const newComposition = composition.filter((_, i) => i !== index);
        setComposition(newComposition);
    };

    const updateComposition = (index: number, field: keyof MaterialComposition, value: any) => {
        const newComposition = [...composition];
        newComposition[index] = {
            ...newComposition[index],
            [field]: value,
        };
        setComposition(newComposition);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.productName.trim()) {
            newErrors.productName = 'Product name is required';
        }

        if (!formData.vehicleId.trim()) {
            newErrors.vehicleId = 'Vehicle ID is required';
        }

        if (!formData.source) {
            newErrors.source = 'Material source is required';
        }

        if (!formData.expectedQuantity || parseFloat(formData.expectedQuantity) <= 0) {
            newErrors.expectedQuantity = 'Expected quantity must be greater than 0';
        }

        // Validate composition
        const totalPercentage = composition.reduce((sum, c) => sum + c.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            newErrors.composition = 'Material composition percentages must sum to 100%';
        }

        composition.forEach((comp, idx) => {
            if (!comp.materialTypeCode.trim()) {
                newErrors[`comp_code_${idx}`] = 'Material code is required';
            }
            if (!comp.materialTypeName.trim()) {
                newErrors[`comp_name_${idx}`] = 'Material name is required';
            }
            if (!comp.rigidity) {
                newErrors[`comp_rigidity_${idx}`] = 'Rigidity is required';
            }
            if (comp.percentage <= 0 || comp.percentage > 100) {
                newErrors[`comp_pct_${idx}`] = 'Percentage must be between 0 and 100';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setSnackbarMessage('Please fix the errors before submitting');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const input: CreateBatchInput = {
                productName: formData.productName.trim(),
                productType: formData.productType,
                vehicleId: formData.vehicleId.trim(),
                source: formData.source as 'SUPPLIER' | 'WAREHOUSE',
                composition: composition as unknown as MaterialComposition[],
                expectedQuantity: parseFloat(formData.expectedQuantity),
                unit: formData.unit,
                startDate: new Date(formData.startDate),
                notes: formData.notes || undefined,
                metadata: {
                    supplier: formData.supplier || undefined,
                    lotNumber: formData.lotNumber || undefined,
                    qualityGrade: formData.qualityGrade || undefined,
                },
                createdBy: 'OP-001', // In Phase 2, this will come from auth context
            };

            const batch = await batchService.createBatch(input);

            setSnackbarMessage(`Batch ${batch.id} created successfully!`);
            setSnackbarSeverity('success');
            setShowSnackbar(true);

            // Redirect after short delay
            setTimeout(() => {
                navigate('/batches');
            }, 1500);
        } catch (error: any) {
            console.error('Error creating batch:', error);
            setSnackbarMessage(error.message || 'Error creating batch');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
            setIsSubmitting(false);
        }
    };

    const totalPercentage = composition.reduce((sum, c) => sum + c.percentage, 0);
    const isCompositionValid = Math.abs(totalPercentage - 100) < 0.01;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Create New Batch
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Register a new production batch for tracking
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Basic Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Product Name"
                        value={formData.productName}
                        onChange={(e) => {
                            setFormData({ ...formData, productName: e.target.value });
                            setErrors({ ...errors, productName: '' });
                        }}
                        placeholder="e.g., Recycled HDPE Pellets"
                        required
                        error={!!errors.productName}
                        helperText={errors.productName}
                    />

                    <TextField
                        fullWidth
                        label="Vehicle ID"
                        value={formData.vehicleId}
                        onChange={(e) => {
                            setFormData({ ...formData, vehicleId: e.target.value });
                            setErrors({ ...errors, vehicleId: '' });
                        }}
                        placeholder="e.g., TRK-2026-01"
                        required
                        error={!!errors.vehicleId}
                        helperText={errors.vehicleId}
                    />

                    <FormControl fullWidth error={!!errors.source}>
                        <InputLabel>Material Source *</InputLabel>
                        <Select
                            value={formData.source}
                            label="Material Source *"
                            onChange={(e) => {
                                setFormData({ ...formData, source: e.target.value });
                                setErrors({ ...errors, source: '' });
                            }}
                        >
                            <MenuItem value="SUPPLIER">Supplier</MenuItem>
                            <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
                        </Select>
                        {errors.source && <Typography color="error" variant="caption" sx={{ ml: 2, mt: 0.5 }}>{errors.source}</Typography>}
                    </FormControl>

                    {formData.source === 'WAREHOUSE' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <TextField
                                fullWidth
                                label="Source Batch ID"
                                value={formData.sourceBatchId}
                                onChange={(e) => setFormData({ ...formData, sourceBatchId: e.target.value })}
                                placeholder="e.g., BATCH-2026-001"
                                helperText="Enter the ID of the batch this material was returned from"
                            />
                            {returnedMaterialInfo && (
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        color="info"
                                        size="small"
                                        label={`Returned Material — Rigid ${returnedMaterialInfo.rigidPercentage}% / Non-Rigid ${returnedMaterialInfo.nonRigidPercentage}%`}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Product Type *</InputLabel>
                        <Select
                            value={formData.productType}
                            label="Product Type *"
                            onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
                        >
                            <MenuItem value="PELLETS">Pellets</MenuItem>
                            <MenuItem value="FLAKES">Flakes</MenuItem>
                            <MenuItem value="GRANULES">Granules</MenuItem>
                            <MenuItem value="REGRIND">Regrind</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Expected Quantity"
                            type="number"
                            value={formData.expectedQuantity}
                            onChange={(e) => {
                                setFormData({ ...formData, expectedQuantity: e.target.value });
                                setErrors({ ...errors, expectedQuantity: '' });
                            }}
                            placeholder="Enter quantity"
                            required
                            error={!!errors.expectedQuantity}
                            helperText={errors.expectedQuantity}
                            inputProps={{ step: '0.01', min: '0' }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                value={formData.unit}
                                label="Unit"
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                            >
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="lbs">lbs</MenuItem>
                                <MenuItem value="ton">ton</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Material Composition
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Define the material composition. Percentages must sum to 100%.
                </Typography>

                {composition.map((comp, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1.5fr 1.5fr 1fr auto' }, gap: 2, alignItems: 'start' }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Material Code"
                                value={comp.materialTypeCode}
                                onChange={(e) => updateComposition(index, 'materialTypeCode', e.target.value)}
                                placeholder="e.g., MAT-R01"
                                required
                                error={!!errors[`comp_code_${index}`]}
                                helperText={errors[`comp_code_${index}`]}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Material Name"
                                value={comp.materialTypeName}
                                onChange={(e) => updateComposition(index, 'materialTypeName', e.target.value)}
                                placeholder="e.g., Post-Consumer HDPE"
                                required
                                error={!!errors[`comp_name_${index}`]}
                                helperText={errors[`comp_name_${index}`]}
                            />

                            <FormControl fullWidth size="small">
                                <InputLabel>Classification</InputLabel>
                                <Select
                                    value={comp.classification}
                                    label="Classification"
                                    onChange={(e) => updateComposition(index, 'classification', e.target.value)}
                                >
                                    <MenuItem value="RECYCLED">Recycled</MenuItem>
                                    <MenuItem value="VIRGIN">Virgin</MenuItem>
                                    <MenuItem value="MIXED">Mixed</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small" error={!!errors[`comp_rigidity_${index}`]}>
                                <InputLabel>Rigidity</InputLabel>
                                <Select
                                    value={comp.rigidity || ''}
                                    label="Rigidity"
                                    onChange={(e) => updateComposition(index, 'rigidity', e.target.value)}
                                >
                                    <MenuItem value="RIGID">Rigid</MenuItem>
                                    <MenuItem value="NON_RIGID">Non-Rigid</MenuItem>
                                </Select>
                                {errors[`comp_rigidity_${index}`] && <Typography color="error" variant="caption" sx={{ ml: 2, mt: 0.5 }}>{errors[`comp_rigidity_${index}`]}</Typography>}
                            </FormControl>

                            <TextField
                                fullWidth
                                size="small"
                                label="Percentage"
                                type="number"
                                value={comp.percentage || ''}
                                onChange={(e) => updateComposition(index, 'percentage', parseFloat(e.target.value) || 0)}
                                placeholder="%"
                                required
                                error={!!errors[`comp_pct_${index}`]}
                                helperText={errors[`comp_pct_${index}`]}
                                inputProps={{ step: '0.1', min: '0', max: '100' }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {composition.length > 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={() => removeCompositionRow(index)}
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={addCompositionRow}
                    >
                        Add Material
                    </Button>

                    <Typography
                        variant="body2"
                        color={isCompositionValid ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                    >
                        Total: {totalPercentage.toFixed(1)}%
                    </Typography>
                </Box>

                {errors.composition && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.composition}
                    </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Additional Information (Optional)
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <TextField
                        fullWidth
                        label="Supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="e.g., EcoPlastics Ltd"
                    />

                    <TextField
                        fullWidth
                        label="Lot Number"
                        value={formData.lotNumber}
                        onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                        placeholder="e.g., LOT-2026-Q1-001"
                    />

                    <TextField
                        fullWidth
                        label="Quality Grade"
                        value={formData.qualityGrade}
                        onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                        placeholder="e.g., A, B, C"
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any relevant notes..."
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        size="large"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Batch'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => navigate('/batches')}
                        disabled={isSubmitting}
                        size="large"
                    >
                        Cancel
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowSnackbar(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BatchCreate;
