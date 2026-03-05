import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MESContextType {
    isOnline: boolean;
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
