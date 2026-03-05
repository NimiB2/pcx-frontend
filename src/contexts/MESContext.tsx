/**
 * MESContext — tracks the simulated MES (Manufacturing Execution System) connection state.
 *
 * In production this would be driven by a WebSocket or polling connection to the MES.
 * For now, `isOnline` is toggled manually (e.g. from the dev toolbar or a test utility).
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MESContextType {
    /** Whether the MES is currently considered online and syncing data. */
    isOnline: boolean;
    /** Manually flips the online/offline state — used for development and demo purposes. */
    toggleMESStatus: () => void;
}

const MESContext = createContext<MESContextType | undefined>(undefined);

export const MESProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(true);

    const toggleMESStatus = () => {
        setIsOnline(prev => !prev);
    };

    return (
        <MESContext.Provider value={{ isOnline, toggleMESStatus }}>
            {children}
        </MESContext.Provider>
    );
};

export const useMES = () => {
    const context = useContext(MESContext);
    if (context === undefined) {
        throw new Error('useMES must be used within a MESProvider');
    }
    return context;
};
