import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    mockBatches,
    mockDiscrepancies,
    mockMeasurements,
    mockPunchListTasks,
    mockVRCQs,
    mockCodebook,
    mockCreditSummary,
    mockMonthlyCredits
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
    vrcqApproval?: { status: string };
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
    status: 'OPEN' | 'RESOLVED' | 'IGNORED' | 'ACKNOWLEDGED';
    slaDeadline?: Date;
    resolvedAt?: Date;
    resolution?: string;
    createdAt?: Date; // Added for sort fallback if detected absent
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
    validationStatus?: string;
    source?: string;
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

export interface CreditSummary {
    totalEligibleKg: number;
    totalRigidKg: number;
    totalNonRigidKg: number;
    flaggedKg: number;
    flaggedPercentage: number;
    completionPercentage: number;
    annualTargetKg: number;
    projectedYearEndKg: number;
}

export interface MonthlyCredit {
    month: string;
    actual: number;
    projected: number;
    isProjected: boolean;
}

interface DataContextType {
    batches: Batch[];
    discrepancies: Discrepancy[];
    measurements: Measurement[];
    punchListTasks: PunchListTask[];
    creditSummary: CreditSummary;
    monthlyCredits: MonthlyCredit[];

    // Actions
    updateBatchStatus: (batchId: string, status: string) => void;
    addDiscrepancy: (discrepancy: Omit<Discrepancy, 'id'>) => void;
    resolveDiscrepancy: (id: string, resolution: string) => void;
    acknowledgeDiscrepancy: (id: string) => void;
    addMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
    updateTaskStatus: (taskId: string, status: PunchListTask['status']) => void;
    addTask: (task: Omit<PunchListTask, 'id' | 'status' | 'progress' | 'completedDate'>) => void;
    updateTaskDetails: (taskId: string, updates: Partial<PunchListTask>) => void;
    deleteTask: (taskId: string) => void;

    // Masking
    isMasked: boolean;
    toggleMasking: () => void;
    getIdentity: (code: string | undefined) => string;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

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
    const [creditSummary, setCreditSummary] = useState<CreditSummary>(mockCreditSummary);
    const [monthlyCredits, setMonthlyCredits] = useState<MonthlyCredit[]>(mockMonthlyCredits);

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

    const acknowledgeDiscrepancy = (id: string) => {
        setDiscrepancies(prev => prev.map(d =>
            d.id === id ? {
                ...d,
                status: 'ACKNOWLEDGED'
            } : d
        ));
    };

    const addDiscrepancy = (discrepancy: Omit<Discrepancy, 'id'>) => {
        const newDiscrepancy = {
            ...discrepancy,
            id: `DISC-${Date.now()}`
        };
        setDiscrepancies(prev => [newDiscrepancy, ...prev]);
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

    const addTask = (taskInput: Omit<PunchListTask, 'id' | 'status' | 'progress' | 'completedDate'>) => {
        const newTask: PunchListTask = {
            ...taskInput,
            id: `TASK-${Date.now()}`,
            status: 'PENDING',
            progress: 0,
        };
        setPunchListTasks(prev => [...prev, newTask]);
    };

    const updateTaskDetails = (taskId: string, updates: Partial<PunchListTask>) => {
        setPunchListTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        ));
    };

    const deleteTask = (taskId: string) => {
        setPunchListTasks(prev => {
            // Remove the task
            const filtered = prev.filter(t => t.id !== taskId);
            // Also remove this task from any dependencies array
            return filtered.map(t => ({
                ...t,
                dependencies: t.dependencies?.filter(depId => depId !== taskId)
            }));
        });
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
            creditSummary,
            monthlyCredits,
            updateBatchStatus,
            addDiscrepancy,
            resolveDiscrepancy,
            acknowledgeDiscrepancy,
            addMeasurement,
            updateTaskStatus,
            addTask,
            updateTaskDetails,
            deleteTask,
            isMasked,
            toggleMasking,
            getIdentity
        }}>
            {children}
        </DataContext.Provider>
    );
};
