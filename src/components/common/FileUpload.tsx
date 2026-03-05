import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    styled
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const UploadContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    border: `2px dashed ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
    },
}));

/** Props for the FileUpload component. */
interface FileUploadProps {
    /** Called with the selected File object after validation passes. */
    onFileSelect: (file: File) => void;
    /** MIME type or extension filter passed to the hidden input (e.g. '.pdf,.jpg'). Defaults to '*\/*'. */
    accept?: string;
    /** Maximum allowed file size in megabytes. Defaults to 10. */
    maxSizeMB?: number;
}

/**
 * FileUpload Component
 *
 * Drag-and-drop (or click-to-browse) file uploader with size validation.
 * Calls `onFileSelect` only when the file passes validation.
 * In development mode, a "[DEV] Use Mock File" button bypasses the dialog for quick testing.
 *
 * @component
 */
const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept = '*/*',
    maxSizeMB = 10
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    /** Clears any existing error and validates size; sets an error message and returns false on failure. */
    const validateFile = (file: File): boolean => {
        setError(null);

        // Basic size validation
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
            return false;
        }

        // We could add file type validation here based on 'accept' 
        // string (e.g. '.pdf,.docx') if needed.

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                onFileSelect(file);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                onFileSelect(file);
            }
        }
    };

    return (
        <Box>
            <UploadContainer
                elevation={isDragging ? 3 : 0}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                    borderColor: isDragging ? 'primary.main' : 'divider',
                    bgcolor: isDragging ? 'primary.light' : 'background.default',
                    color: isDragging ? 'white' : 'text.primary',
                    '&:hover': {
                        bgcolor: isDragging ? 'primary.main' : 'action.hover'
                    }
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept={accept}
                    style={{ display: 'none' }}
                />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Drag and drop file here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Or click to browse from your computer
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                    Max file size: {maxSizeMB}MB
                </Typography>

                {/* Dev Only: Mock File Button for Subagent Testing */}
                {process.env.NODE_ENV === 'development' && (
                    <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                            e.stopPropagation(); // Don't trigger the file input
                            const mockFile = new File(['mock content'], 'test_evidence.pdf', { type: 'application/pdf' });
                            onFileSelect(mockFile);
                        }}
                    >
                        [DEV] Use Mock File
                    </Button>
                )}
            </UploadContainer>
            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default FileUpload;
