import { createTheme } from '@mui/material/styles';

// Industrial "Traffic Light" Palette
const colors = {
    traffic: {
        red: '#D32F2F',    // Blocking Error / Critical
        yellow: '#FBC02D', // Warning / Minor Deviation
        green: '#388E3C',  // Verified / Valid
        gray: '#757575',   // Informational / Pending
    },
    background: {
        default: '#F5F5F5', // Light Gray background for contrast
        paper: '#FFFFFF',
        sidebar: '#1A2027', // Dark sidebar for "Official" look
    },
    text: {
        primary: '#000000', // High contrast black
        secondary: '#424242',
        contrast: '#FFFFFF',
    },
};

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.background.sidebar, // Use dark for primary actions/sidebar
        },
        secondary: {
            main: colors.traffic.gray,
        },
        error: {
            main: colors.traffic.red,
        },
        warning: {
            main: colors.traffic.yellow,
        },
        success: {
            main: colors.traffic.green,
        },
        background: {
            default: colors.background.default,
            paper: colors.background.paper,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2rem' },
        h2: { fontWeight: 600, fontSize: '1.75rem' },
        h3: { fontWeight: 600, fontSize: '1.5rem' },
        h4: { fontWeight: 600, fontSize: '1.25rem' },
        h5: { fontWeight: 600, fontSize: '1rem' },
        h6: { fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
        body1: { fontSize: '0.875rem', lineHeight: 1.5 }, // Compact body
        body2: { fontSize: '0.75rem', lineHeight: 1.4 }, // Very compact secondary
    },
    components: {
        // Rigid Table Styles
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#E0E0E0',
                    '& .MuiTableCell-root': {
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        color: '#000000',
                        borderBottom: '2px solid #000000',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '6px 16px', // Compact padding
                    borderBottom: '1px solid #E0E0E0',
                    fontSize: '0.875rem',
                },
            },
        },
        // Dense Buttons
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '2px', // Square, industrial look
                    textTransform: 'none',
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        // Cards as "Panels"
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '0px',
                    border: '1px solid #BDBDBD',
                    boxShadow: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '4px', // Rectangular chips
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px',
                },
            },
        },
    },
});

export default theme;
