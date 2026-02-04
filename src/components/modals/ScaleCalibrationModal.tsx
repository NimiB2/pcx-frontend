import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    InputAdornment
} from '@mui/material';
import { Scale, CheckCircle, PhotoCamera } from '@mui/icons-material';

interface ScaleCalibrationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ScaleCalibrationModal: React.FC<ScaleCalibrationModalProps> = ({ open, onClose, onConfirm }) => {
    const [weight, setWeight] = useState('');
    const [photoTaken, setPhotoTaken] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            onConfirm();
            onClose();
        }, 1000);
    };

    const isValid = weight && parseFloat(weight) > 0 && photoTaken;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Scale color="primary" />
                Verify Scale Calibration
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Please place the standard 5kg test weight on the scale and record the reading.
                    Take a photo of the display for evidence.
                </Typography>

                <Box sx={{ my: 3 }}>
                    <TextField
                        autoFocus
                        label="Test Weight Reading"
                        type="number"
                        fullWidth
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                        }}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        variant={photoTaken ? "contained" : "outlined"}
                        color={photoTaken ? "success" : "primary"}
                        fullWidth
                        startIcon={photoTaken ? <CheckCircle /> : <PhotoCamera />}
                        onClick={() => setPhotoTaken(true)}
                        sx={{ height: 50 }}
                    >
                        {photoTaken ? "Photo Evidence Attached" : "Capture Scale Display"}
                    </Button>
                </Box>

                {weight && Math.abs(parseFloat(weight) - 5.0) > 0.05 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Reading deviates from 5.0kg standard. Calibration may be required.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid || submitting}
                >
                    {submitting ? "Verifying..." : "Confirm Calibration"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScaleCalibrationModal;
