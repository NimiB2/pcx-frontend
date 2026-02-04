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
    Alert
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';

interface SupersedeModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (newValue: number, reason: string) => void;
    originalValue: number;
    unit: string;
    batchId: string;
}

const SupersedeModal: React.FC<SupersedeModalProps> = ({
    open,
    onClose,
    onConfirm,
    originalValue,
    unit,
    batchId
}) => {
    const [newValue, setNewValue] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!newValue || !reason) return;

        setSubmitting(true);
        // Simulate API delay
        setTimeout(() => {
            onConfirm(parseFloat(newValue), reason);
            setSubmitting(false);
            onClose();
            // Reset fields
            setNewValue('');
            setReason('');
        }, 800);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="warning" />
                Correct Data (Supersede)
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        You are creating a <strong>Superseding Record</strong> for Batch {batchId}.
                        The original value ({originalValue} {unit}) will be retained in the audit trail but replaced for calculations.
                    </Typography>

                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action will be logged in the permanent Audit Trail.
                    </Alert>
                </Box>

                <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        autoFocus
                        label={`Corrected Value (${unit})`}
                        type="number"
                        fullWidth
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={originalValue.toString()}
                    />

                    <TextField
                        label="Reason for Correction"
                        multiline
                        rows={3}
                        fullWidth
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Scale calibration error verified by QA..."
                        helperText="Detailed justification is required."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="warning"
                    startIcon={<Save />}
                    disabled={!newValue || !reason || submitting}
                >
                    {submitting ? "Saving..." : "Create Record"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupersedeModal;
