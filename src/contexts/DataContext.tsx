import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    mockBatches,
    mockDiscrepancies,
    mockMeasurements,
    mockPunchListTasks,
    mockVRCQs,
    mockCodebook
} from '../mockData';

// Define types based on mock data structure
export interface Batch {
    id: string;
    type: string;
    status: string;
    productCode: string;
    productName: string;
    recycledPercentage: number;
    startDate: Date;
    targetQuantity: number;
    currentQuantity: number;
    operator: string;
    completedDate?: Date;
}

export interface Discrepancy {
    id: string;
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    batchId: string;
    expectedValue?: number;
    actualValue?: number;
    difference?: number;
    unit?: string;
    detected: Date;
    status: 'OPEN' | 'RESOLVED' | 'IGNORED';
    slaDeadline?: Date;
    resolvedAt?: Date;
    resolution?: string;
}

export interface Measurement {
    id: string;
    timestamp: Date;
    station: string;
    processStep: string;
    value: number;
    unit: string;
    materialType: string;
    materialCode: string;
    operator: string;
    batchId: string;
    status: string;
}

export interface PunchListTask {
    id: string;
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    assignedTo: string;
    dueDate: Date;
    progress: number;
    completedDate?: Date;
    dependencies?: string[];
}

interface DataContextType {
    batches: Batch[];
    discrepancies: Discrepancy[];
    measurements: Measurement[];
    punchListTasks: PunchListTask[];

    // Actions
    updateBatchStatus: (batchId: string, status: string) => void;
    resolveDiscrepancy: (id: string, resolution: string) => void;
    addMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
    updateTaskStatus: (taskId: string, status: PunchListTask['status']) => void;

    // Masking
    isMasked: boolean;
    toggleMasking: () => void;
    getIdentity: (code: string | undefined) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize with mock data
    // We cast mock data to types because TypeScript might infer literal types which are too narrow, 
    // or we might have small mismatches that we want to remain flexible about for now.
    const [batches, setBatches] = useState<Batch[]>(mockBatches as any[]);
    const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(mockDiscrepancies as any[]);
    const [measurements, setMeasurements] = useState<Measurement[]>(mockMeasurements as any[]);
    const [punchListTasks, setPunchListTasks] = useState<PunchListTask[]>(mockPunchListTasks as any[]);

    const updateBatchStatus = (batchId: string, status: string) => {
        setBatches(prev => prev.map(b =>
            b.id === batchId ? { ...b, status } : b
        ));
    };

    const resolveDiscrepancy = (id: string, resolution: string) => {
        setDiscrepancies(prev => prev.map(d =>
            d.id === id ? {
                ...d,
                status: 'RESOLVED',
                resolution,
                resolvedAt: new Date()
            } : d
        ));
    };

    const addMeasurement = (measurement: Omit<Measurement, 'id'>) => {
        const newMeasurement = {
            ...measurement,
            id: `k-${Date.now()}` // Simple ID generation
        };
        setMeasurements(prev => [newMeasurement, ...prev]);
    };

    const updateTaskStatus = (taskId: string, status: PunchListTask['status']) => {
        setPunchListTasks(prev => prev.map(t =>
            t.id === taskId ? {
                ...t,
                status,
                progress: status === 'COMPLETED' ? 100 : t.progress,
                completedDate: status === 'COMPLETED' ? new Date() : undefined
            } : t
        ));
    };

    // Mock Codebook Data
    const codebook = mockCodebook;
    const [isMasked, setIsMasked] = useState(false);

    const toggleMasking = () => setIsMasked(prev => !prev);

    const getIdentity = (code: string | undefined): string => {
        if (!code) return '';
        if (!isMasked) {
            const entry = codebook.find(c => c.code === code);
            return entry ? entry.realIdentity : code;
        }
        return code;
    };

    return (
        <DataContext.Provider value={{
            batches,
            discrepancies,
            measurements,
            punchListTasks,
            updateBatchStatus,
            resolveDiscrepancy,
            addMeasurement,
            updateTaskStatus,
            isMasked,
            toggleMasking,
            getIdentity
        }}>
            {children}
        </DataContext.Provider>
    );
};
