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

/** Props for the SupersedeModal component. */
interface SupersedeModalProps {
    /** Controls the dialog's open/closed state. */
    open: boolean;
    /** Called when the user cancels. */
    onClose: () => void;
    /**
     * Called after the operator confirms the correction.
     * @param newValue - The corrected numeric value.
     * @param reason   - The mandatory justification text.
     */
    onConfirm: (newValue: number, reason: string) => void;
    /** The original value being corrected. Shown to the operator for reference. */
    originalValue: number;
    /** Unit of the value (e.g. 'kg'). */
    unit: string;
    /** The ID of the batch the measurement belongs to, shown in the dialog body. */
    batchId: string;
}

/**
 * SupersedeModal Component
 *
 * Allows an authorised user to correct (supersede) a measurement value.
 * The correction creates a new record while **preserving the original** in the audit trail.
 * Both a corrected value and a written justification are required before submission.
 * The action is flagged as permanent in the UI to reinforce its audit significance.
 */
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
