import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { AttachFile as PaperclipIcon } from '@mui/icons-material';

interface EvidenceLinkProps {
    hasEvidence: boolean;
    onClick?: () => void;
    count?: number;
}

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
