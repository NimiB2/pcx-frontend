import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Chip
} from '@mui/material';
import { Send, Delete, EditNote } from '@mui/icons-material';

interface Note {
    id: string;
    text: string;
    timestamp: Date;
    author: string;
}

const ShiftNotes: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            text: 'Shift handover complete. Bin 3 is empty.',
            timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
            author: 'Prev. Shift'
        }
    ]);
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note: Note = {
            id: Date.now().toString(),
            text: newNote,
            timestamp: new Date(),
            author: 'Me'
        };
        setNotes([note, ...notes]);
        setNewNote('');
    };

    const handleDelete = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EditNote sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                    Shift Log
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Log event or handover note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button
                    variant="contained"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    sx={{ minWidth: 'auto', px: 2 }}
                >
                    <Send fontSize="small" />
                </Button>
            </Box>

            <List sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: '#fafafa',
                borderRadius: 1,
                border: '1px solid #eee'
            }}>
                {notes.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="body2">No notes for this shift yet.</Typography>
                    </Box>
                )}
                {notes.map((note, index) => (
                    <React.Fragment key={note.id}>
                        <ListItem
                            secondaryAction={
                                note.author === 'Me' && (
                                    <IconButton edge="end" size="small" onClick={() => handleDelete(note.id)}>
                                        <Delete fontSize="small" color="action" />
                                    </IconButton>
                                )
                            }
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {note.text}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                        <Chip
                                            label={note.author}
                                            size="small"
                                            color={note.author === 'Me' ? 'primary' : 'default'}
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < notes.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default ShiftNotes;
