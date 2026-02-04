import React, { useState, useEffect } from 'react';
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
    Alert,
    Snackbar,
    Chip,
    IconButton,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Save,
    PhotoCamera,
    Description,
    Add,
    Delete,
    AccessTime,
    QrCodeScanner,
    CheckCircle,
    Warning,
    History,
    ExpandMore,
    Edit,
    Check,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { measurementService, CreateMeasurementInput } from '../services/measurementService';
import { mockBatches } from '../mockData';

// --- Types & Constants ---

const STATIONS = [
    { id: 'INTAKE-01', name: 'Raw Material Intake', type: 'INTAKE' },
    { id: 'MIXING-01', name: 'Mixing Station', type: 'MIXING' },
    { id: 'EXTRUSION-01', name: 'Extrusion Line A', type: 'STANDARD' },
    { id: 'EXTRUSION-02', name: 'Extrusion Line B', type: 'STANDARD' },
    { id: 'PACKAGING-01', name: 'Packaging', type: 'STANDARD' },
];

const PROCESS_STEPS = [
    'Material Receipt',
    'Sorting',
    'Shredding',
    'Washing',
    'Extrusion',
    'Packaging',
];

type MaterialClass = 'RECYCLED' | 'VIRGIN' | 'MIXED';

interface IngredientRow {
    id: string;
    materialClass: MaterialClass;
    weight: string;
    materialCode: string;
}

// --- Components ---

const MeasurementCapture: React.FC = () => {
    const navigate = useNavigate();

    // --- State ---

    // Workflow State
    const [activeStage, setActiveStage] = useState<'SETUP' | 'DATA' | 'EVIDENCE'>('SETUP');

    // Context
    const [stationId, setStationId] = useState('INTAKE-01');
    const [processStep, setProcessStep] = useState(PROCESS_STEPS[0]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Batch
    const [batchId, setBatchId] = useState('');
    // const [batchStatus, setBatchStatus] = useState<string | null>(null); // Removed, now derived from activeBatch

    // Measurement Data
    const [source, setSource] = useState<'MES' | 'SCALE' | 'MANUAL'>('SCALE');
    // Standard Single Entry
    const [singleValue, setSingleValue] = useState('');
    const [singleMaterialClass, setSingleMaterialClass] = useState<MaterialClass>('RECYCLED');
    const [singleMaterialCode, setSingleMaterialCode] = useState('');
    // Mixing Entry
    const [ingredients, setIngredients] = useState<IngredientRow[]>([
        { id: '1', materialClass: 'RECYCLED', weight: '', materialCode: '' }
    ]);

    // Common
    const [unit, setUnit] = useState<'kg' | 'lbs' | 'ton'>('kg');
    const [notes, setNotes] = useState('');
    const [justification, setJustification] = useState('');

    // Evidence
    const [evidenceAttached, setEvidenceAttached] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // UI Feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // --- Effects ---

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update minutely
        return () => clearInterval(timer);
    }, []);

    // Update batch status when selected - REMOVED, now derived from activeBatch
    // useEffect(() => {
    //     if (batchId) {
    //         const batch = mockBatches.find(b => b.id === batchId);
    //         setBatchStatus(batch ? batch.status.replace('_', ' ') : 'Unknown');
    //     } else {
    //         setBatchStatus(null);
    //     }
    // }, [batchId]);

    // --- Helpers ---

    const currentStation = STATIONS.find(s => s.id === stationId);
    const isMixing = currentStation?.type === 'MIXING';
    const totalMixingWeight = ingredients.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0);
    const activeBatch = mockBatches.find(b => b.id === batchId);

    // --- Validation & Workflow ---

    const validateSetup = () => {
        if (!processStep) return false;
        if (isMixing && !batchId) return false; // Mixing usually implies a batch
        return true;
    };

    const validateData = () => {
        if (source === 'MANUAL' && !justification.trim()) return false;

        if (isMixing) {
            return !ingredients.some(i => !i.weight || parseFloat(i.weight) <= 0 || !i.materialCode);
        } else {
            return (!!singleValue && parseFloat(singleValue) > 0 && !!singleMaterialCode);
        }
    };

    const handleNextStage = (next: 'DATA' | 'EVIDENCE') => {
        setActiveStage(next);
        // Scroll to top or appropriately could be added here
    };

    const handleSubmit = async () => {
        // Validation is now handled by accordion logic before reaching this point
        // const error = validate();
        // if (error) {
        //     setSnackbar({ open: true, message: error, severity: 'error' });
        //     return;
        // }

        setIsSubmitting(true);
        try {
            const commonData = {
                source: source === 'SCALE' || source === 'MES' ? source : 'MANUAL', // Map simplify
                timestamp: new Date(),
                stationId,
                stationName: currentStation?.name || '',
                processStep,
                location: {
                    stationId,
                    stationName: currentStation?.name || '',
                    processStep,
                },
                batchId: batchId || null,
                unit,
                operatorId: 'OP-001', // Mock
                operatorName: 'Operator 1',
                notes: notes || undefined,
                entryJustification: justification || undefined,
            };

            if (isMixing) {
                // Submit multiple measurements
                for (const row of ingredients) {
                    await measurementService.createMeasurement({
                        ...commonData,
                        source: commonData.source as any, // TS Cast
                        value: parseFloat(row.weight),
                        materialClassification: row.materialClass,
                        materialTypeCode: row.materialCode,
                    });
                }
            } else {
                // Submit single
                await measurementService.createMeasurement({
                    ...commonData,
                    source: commonData.source as any, // TS Cast
                    value: parseFloat(singleValue),
                    materialClassification: singleMaterialClass,
                    materialTypeCode: singleMaterialCode,
                });
            }

            setSnackbar({ open: true, message: "Measurement(s) recorded successfully", severity: 'success' });
            setTimeout(() => navigate('/measurements'), 1500);
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || "Failed to save", severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Handlers ---

    const handleAddIngredient = () => {
        setIngredients([
            ...ingredients,
            { id: Date.now().toString(), materialClass: 'RECYCLED', weight: '', materialCode: '' }
        ]);
    };

    const handleRemoveIngredient = (id: string) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter(row => row.id !== id));
        }
    };

    const handleIngredientChange = (id: string, field: keyof IngredientRow, value: any) => {
        setIngredients(ingredients.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    return (
        <Box sx={{ pb: 10 }}>
            {/* Header / Top Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid #eee'
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight="bold">New Measurement</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {currentStation?.name} • OP-001
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={<AccessTime />}
                        label={currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Paper>

            {/* STAGE 1: SETUP (Context & Batch) */}
            <Accordion
                expanded={activeStage === 'SETUP'}
                onChange={(_, expanded) => expanded && setActiveStage('SETUP')}
                sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: 2 }}
            >
                <AccordionSummary expandIcon={activeStage === 'SETUP' ? null : <Edit fontSize="small" color="primary" />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar sx={{ bgcolor: activeStage === 'SETUP' ? 'primary.main' : 'success.main', width: 32, height: 32 }}>
                            {activeStage === 'SETUP' ? '1' : <Check fontSize="small" />}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Station & Context</Typography>
                            {activeStage !== 'SETUP' && (
                                <Typography variant="body2" color="text.secondary">
                                    {currentStation?.name} • {batchId ? `Batch: ${batchId}` : 'No Batch'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'grid', gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Station</InputLabel>
                            <Select
                                value={stationId}
                                label="Station"
                                onChange={(e) => setStationId(e.target.value)}
                            >
                                {STATIONS.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Production Step</InputLabel>
                            <Select
                                value={processStep}
                                label="Production Step"
                                onChange={(e) => setProcessStep(e.target.value)}
                            >
                                {PROCESS_STEPS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Production Batch (Optional for intake)</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Active Batch</InputLabel>
                                    <Select
                                        value={batchId}
                                        label="Active Batch"
                                        onChange={(e) => setBatchId(e.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton size="small"><QrCodeScanner /></IconButton>
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {mockBatches.map(b => (
                                            <MenuItem key={b.id} value={b.id}>{b.id} - {b.productName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            {activeBatch && (
                                <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                                    Status: {activeBatch.status.replace('_', ' ')} | Product: {activeBatch.productName}
                                </Alert>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => handleNextStage('DATA')}
                            disabled={!validateSetup()}
                        >
                            Confirm & Continue
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* STAGE 2: DATA (Source & Values) */}
            <Accordion
                expanded={activeStage === 'DATA'}
                onChange={(_, expanded) => {
                    if (expanded) {
                        // Only allow expanding if setup is valid
                        if (validateSetup()) setActiveStage('DATA');
                        else setSnackbar({ open: true, message: "Please complete setup first", severity: "error" });
                    }
                }}
                disabled={activeStage === 'SETUP' && !validateSetup()}
                sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: 2 }}
            >
                <AccordionSummary expandIcon={activeStage === 'DATA' ? null : <Edit fontSize="small" color="primary" />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar sx={{ bgcolor: activeStage === 'DATA' ? 'primary.main' : activeStage === 'EVIDENCE' ? 'success.main' : 'grey.300', width: 32, height: 32 }}>
                            {activeStage === 'EVIDENCE' ? <Check fontSize="small" /> : '2'}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Measurement Data</Typography>
                            {activeStage === 'EVIDENCE' && (
                                <Typography variant="body2" color="text.secondary">
                                    {isMixing ? `${ingredients.length} Ingredients` : `${singleValue} ${unit}`} • {source}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>Data Source</Typography>
                        <ToggleButtonGroup
                            value={source}
                            exclusive
                            onChange={(_, v) => v && setSource(v)}
                            color="primary"
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="MES">MES (Auto)</ToggleButton>
                            <ToggleButton value="SCALE">Scale</ToggleButton>
                            <ToggleButton value="MANUAL">Manual</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {source === 'MANUAL' && (
                        <TextField
                            fullWidth
                            label="Justification"
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            helperText="Why is manual entry required?"
                            error={!justification && isSubmitting}
                            sx={{ mb: 3 }}
                        />
                    )}

                    {/* DYNAMIC CONTENT BASED ON STATION TYPE */}
                    {isMixing ? (
                        <Box>
                            {ingredients.map((row, index) => (
                                <Box key={row.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2, position: 'relative' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Ingredient #{index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => handleRemoveIngredient(row.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <ToggleButtonGroup
                                        value={row.materialClass}
                                        exclusive
                                        onChange={(_, v) => v && handleIngredientChange(row.id, 'materialClass', v)}
                                        fullWidth
                                        size="small"
                                        sx={{ mb: 2 }}
                                    >
                                        <ToggleButton value="RECYCLED" color="success">Recycled</ToggleButton>
                                        <ToggleButton value="VIRGIN" color="error">Virgin</ToggleButton>
                                        <ToggleButton value="MIXED" color="warning">Mixed</ToggleButton>
                                    </ToggleButtonGroup>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <TextField
                                            label="Material Code"
                                            value={row.materialCode}
                                            onChange={(e) => handleIngredientChange(row.id, 'materialCode', e.target.value)}
                                            size="small"
                                        />
                                        <TextField
                                            label={`Weight (${unit})`}
                                            type="number"
                                            value={row.weight}
                                            onChange={(e) => handleIngredientChange(row.id, 'weight', e.target.value)}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            ))}

                            <Button startIcon={<Add />} onClick={handleAddIngredient} fullWidth variant="outlined" sx={{ mb: 2 }}>
                                Add Ingredient
                            </Button>

                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                                <Typography variant="caption" display="block">Total Weight</Typography>
                                <Typography variant="h5" fontWeight="bold" color="primary">{totalMixingWeight} {unit}</Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>Classification</Typography>
                                <ToggleButtonGroup
                                    value={singleMaterialClass}
                                    exclusive
                                    onChange={(_, v) => v && setSingleMaterialClass(v)}
                                    orientation="horizontal"
                                    fullWidth
                                >
                                    <ToggleButton value="RECYCLED" sx={{ flexDirection: 'column', py: 1 }}>
                                        <CheckCircle color="success" />
                                        <Typography variant="caption">Recycled</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="VIRGIN" sx={{ flexDirection: 'column', py: 1 }}>
                                        <Warning color="disabled" />
                                        <Typography variant="caption">Virgin</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="MIXED" sx={{ flexDirection: 'column', py: 1 }}>
                                        <Warning color="warning" />
                                        <Typography variant="caption">Mixed</Typography>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField
                                    label="Material Code"
                                    value={singleMaterialCode}
                                    onChange={(e) => setSingleMaterialCode(e.target.value)}
                                    placeholder="e.g. MAT-01"
                                />
                                <TextField
                                    label={`Weight (${unit})`}
                                    type="number"
                                    value={singleValue}
                                    onChange={(e) => setSingleValue(e.target.value)}
                                    InputProps={{ sx: { fontSize: '1.2rem', fontWeight: 'bold' } }}
                                />
                            </Box>
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                        onClick={() => handleNextStage('EVIDENCE')}
                        disabled={!validateData()}
                    >
                        Confirm Data
                    </Button>
                </AccordionDetails>
            </Accordion>

            {/* STAGE 3: EVIDENCE & FINALIZE */}
            <Accordion
                expanded={activeStage === 'EVIDENCE'}
                onChange={(_, expanded) => {
                    if (expanded && validateSetup() && validateData()) setActiveStage('EVIDENCE');
                }}
                disabled={activeStage !== 'EVIDENCE' && (!validateSetup() || !validateData())}
                sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: 2 }}
            >
                <AccordionSummary>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: activeStage === 'EVIDENCE' ? 'primary.main' : 'grey.300', width: 32, height: 32 }}>3</Avatar>
                        <Typography variant="subtitle1" fontWeight="bold">Evidence & Review</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant={evidenceAttached ? "contained" : "outlined"}
                            color={evidenceAttached ? "success" : "primary"}
                            startIcon={evidenceAttached ? <Check /> : <PhotoCamera />}
                            fullWidth
                            onClick={() => setShowCamera(true)}
                            sx={{ height: 60 }}
                        >
                            {evidenceAttached ? "Evidence Attached" : "Take Photo"}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Description />}
                            fullWidth
                            sx={{ height: 60 }}
                            onClick={() => setEvidenceAttached(true)}
                        >
                            Scan Doc
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes (Optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional observations..."
                        sx={{ mb: 4 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/measurements')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<Save />}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            sx={{ py: 1.5, fontSize: '1.1rem' }}
                        >
                            {isSubmitting ? 'Saving...' : 'SUBMIT RECORD'}
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Camera Mock Dialog */}
            <Dialog open={showCamera} onClose={() => setShowCamera(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Camera</DialogTitle>
                <DialogContent>
                    <Box sx={{ height: 300, bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column' }}>
                        <PhotoCamera sx={{ fontSize: 60, mb: 2 }} />
                        <Typography>Camera View Mock</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCamera(false)}>Close</Button>
                    <Button onClick={() => { setEvidenceAttached(true); setShowCamera(false); }} variant="contained">Capture</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default MeasurementCapture;
