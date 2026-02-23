import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { AttachFile as PaperclipIcon } from '@mui/icons-material';

interface EvidenceLinkProps {
    hasEvidence: boolean;
    onClick?: () => void;
    count?: number;
}

/**
 * EvidenceLink Component
 * 
 * Renders an icon button linking to attached evidence files (e.g., weighbridge tickets, photos).
 * Displays a tooltip indicating the number of attachments or a generic view message.
 * 
 * @component
 * @param {EvidenceLinkProps} props - The component props.
 * @param {boolean} props.hasEvidence - Controls whether the link is visible.
 * @param {() => void} [props.onClick] - Callback when the icon is clicked.
 * @param {number} [props.count] - Optional count of evidence files attached.
 */
const EvidenceLink: React.FC<EvidenceLinkProps> = ({ hasEvidence, onClick, count }) => {
    if (!hasEvidence) return null;

    return (
        <Tooltip title={count ? `View ${count} attachments` : "View Evidence"}>
            <IconButton
                size="small"
                onClick={onClick}
                sx={{
                    color: 'primary.main',
                    padding: '2px',
                    '&:hover': { backgroundColor: 'transparent' }
                }}
            >
                <PaperclipIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default EvidenceLink;
