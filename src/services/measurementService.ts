// Measurement Service - In-memory implementation for Phase 1
// This will be replaced with API calls in Phase 2

export interface MeasurementRecord {
    id: string;
    source: 'MES' | 'SCALE' | 'MANUAL' | 'DOCUMENT_SCAN';
    timestamp: Date;
    recordedAt: Date;
    location: {
        stationId: string;
        stationName: string;
        processStep: string;
    };
    batchId: string | null;
    operatorId: string;
    operatorName: string;
    value: number;
    unit: 'kg' | 'lbs' | 'ton';
    materialClassification: 'RECYCLED' | 'VIRGIN' | 'MIXED';
    materialTypeCode: string;
    evidenceLinks: Evidence[];
    validationStatus: 'PENDING' | 'VALIDATED' | 'FLAGGED';
    metadata: {
        entryJustification?: string;
        supersedes?: string | null;
        supersededBy?: string | null;
        notes?: string;
    };
    audit: {
        createdAt: Date;
        createdBy: string;
        version: number;
    };
}

export interface Evidence {
    evidenceId: string;
    type: 'PHOTO' | 'SCANNED_DOCUMENT';
    url: string;
    filename: string;
    uploadedAt: Date;
}

export interface MeasurementFilter {
    batchId?: string;
    source?: string;
    materialClassification?: string;
    processStep?: string;
    startDate?: Date;
    endDate?: Date;
    validationStatus?: string;
}

export interface CreateMeasurementInput {
    source: 'MES' | 'SCALE' | 'MANUAL' | 'DOCUMENT_SCAN';
    processStep: string;
    stationId: string;
    stationName: string;
    batchId: string | null;
    value: number;
    unit: 'kg' | 'lbs' | 'ton';
    materialClassification: 'RECYCLED' | 'VIRGIN' | 'MIXED';
    materialTypeCode: string;
    operatorId: string;
    operatorName: string;
    notes?: string;
    entryJustification?: string;
}

// In-memory storage (will be replaced with database in Phase 2)
class MeasurementStore {
    private measurements: Map<string, MeasurementRecord> = new Map();
    private currentId = 1000;

    constructor() {
        // Initialize with mock data
        this.initializeMockData();
    }

    private initializeMockData() {
        const mockMeasurements: MeasurementRecord[] = [
            {
                id: 'MR-2026-001',
                source: 'SCALE',
                timestamp: new Date('2026-02-04T08:30:00'),
                recordedAt: new Date('2026-02-04T08:30:05'),
                location: {
                    stationId: 'INTAKE-01',
                    stationName: 'Intake Station 1',
                    processStep: 'Material Receipt - Ready for Production',
                },
                batchId: 'BATCH-2026-001',
                operatorId: 'OP-001',
                operatorName: 'John Operator',
                value: 500.5,
                unit: 'kg',
                materialClassification: 'RECYCLED',
                materialTypeCode: 'MAT-R01',
                evidenceLinks: [],
                validationStatus: 'VALIDATED',
                metadata: {
                    notes: 'Clean material, ready for processing',
                },
                audit: {
                    createdAt: new Date('2026-02-04T08:30:05'),
                    createdBy: 'OP-001',
                    version: 1,
                },
            },
            {
                id: 'MR-2026-002',
                source: 'MANUAL',
                timestamp: new Date('2026-02-04T09:15:00'),
                recordedAt: new Date('2026-02-04T09:15:20'),
                location: {
                    stationId: 'MIXING-01',
                    stationName: 'Mixing Station 1',
                    processStep: 'Before Mixing',
                },
                batchId: 'BATCH-2026-001',
                operatorId: 'OP-001',
                operatorName: 'John Operator',
                value: 450.2,
                unit: 'kg',
                materialClassification: 'VIRGIN',
                materialTypeCode: 'MAT-V01',
                evidenceLinks: [],
                validationStatus: 'PENDING',
                metadata: {
                    entryJustification: 'Scale temporarily unavailable',
                    notes: 'Virgin material addition for recipe compliance',
                },
                audit: {
                    createdAt: new Date('2026-02-04T09:15:20'),
                    createdBy: 'OP-001',
                    version: 1,
                },
            },
            {
                id: 'MR-2026-003',
                source: 'MES',
                timestamp: new Date('2026-02-04T10:45:00'),
                recordedAt: new Date('2026-02-04T10:45:02'),
                location: {
                    stationId: 'EXTRUSION-01',
                    stationName: 'Extrusion Station 1',
                    processStep: 'After Extrusion',
                },
                batchId: 'BATCH-2026-001',
                operatorId: 'OP-002',
                operatorName: 'Jane Smith',
                value: 850.0,
                unit: 'kg',
                materialClassification: 'MIXED',
                materialTypeCode: 'PROD-001',
                evidenceLinks: [],
                validationStatus: 'VALIDATED',
                metadata: {},
                audit: {
                    createdAt: new Date('2026-02-04T10:45:02'),
                    createdBy: 'SYSTEM',
                    version: 1,
                },
            },
        ];

        mockMeasurements.forEach(m => this.measurements.set(m.id, m));
        this.currentId = 1004;
    }

    private generateId(): string {
        const id = `MR-2026-${String(this.currentId).padStart(6, '0')}`;
        this.currentId++;
        return id;
    }

    create(input: CreateMeasurementInput): MeasurementRecord {
        const now = new Date();
        const measurement: MeasurementRecord = {
            id: this.generateId(),
            source: input.source,
            timestamp: now,
            recordedAt: now,
            location: {
                stationId: input.stationId,
                stationName: input.stationName,
                processStep: input.processStep,
            },
            batchId: input.batchId,
            operatorId: input.operatorId,
            operatorName: input.operatorName,
            value: input.value,
            unit: input.unit,
            materialClassification: input.materialClassification,
            materialTypeCode: input.materialTypeCode,
            evidenceLinks: [],
            validationStatus: input.source === 'MANUAL' ? 'PENDING' : 'VALIDATED',
            metadata: {
                notes: input.notes,
                entryJustification: input.entryJustification,
                supersedes: null,
                supersededBy: null,
            },
            audit: {
                createdAt: now,
                createdBy: input.operatorId,
                version: 1,
            },
        };

        this.measurements.set(measurement.id, measurement);
        return measurement;
    }

    getById(id: string): MeasurementRecord | undefined {
        return this.measurements.get(id);
    }

    getAll(filter?: MeasurementFilter): MeasurementRecord[] {
        let results = Array.from(this.measurements.values());

        if (filter) {
            if (filter.batchId) {
                results = results.filter(m => m.batchId === filter.batchId);
            }
            if (filter.source) {
                results = results.filter(m => m.source === filter.source);
            }
            if (filter.materialClassification) {
                results = results.filter(m => m.materialClassification === filter.materialClassification);
            }
            if (filter.processStep) {
                results = results.filter(m => m.location.processStep === filter.processStep);
            }
            if (filter.validationStatus) {
                results = results.filter(m => m.validationStatus === filter.validationStatus);
            }
            if (filter.startDate) {
                results = results.filter(m => m.timestamp >= filter.startDate!);
            }
            if (filter.endDate) {
                results = results.filter(m => m.timestamp <= filter.endDate!);
            }
        }

        // Sort by timestamp descending (newest first)
        return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    supersede(originalId: string, newMeasurement: CreateMeasurementInput): MeasurementRecord {
        const original = this.measurements.get(originalId);
        if (!original) {
            throw new Error(`Measurement ${originalId} not found`);
        }

        // Create new measurement
        const superseding = this.create(newMeasurement);

        // Update metadata to link records
        superseding.metadata.supersedes = originalId;
        original.metadata.supersededBy = superseding.id;

        this.measurements.set(originalId, original);
        this.measurements.set(superseding.id, superseding);

        return superseding;
    }

    attachEvidence(measurementId: string, evidence: Evidence): MeasurementRecord {
        const measurement = this.measurements.get(measurementId);
        if (!measurement) {
            throw new Error(`Measurement ${measurementId} not found`);
        }

        measurement.evidenceLinks.push(evidence);
        this.measurements.set(measurementId, measurement);
        return measurement;
    }

    updateValidationStatus(
        measurementId: string,
        status: 'PENDING' | 'VALIDATED' | 'FLAGGED'
    ): MeasurementRecord {
        const measurement = this.measurements.get(measurementId);
        if (!measurement) {
            throw new Error(`Measurement ${measurementId} not found`);
        }

        measurement.validationStatus = status;
        this.measurements.set(measurementId, measurement);
        return measurement;
    }

    deleteById(id: string, adminId: string): void {
        // Only admins can delete - log to audit trail
        console.log(`Admin ${adminId} deleted measurement ${id}`);
        this.measurements.delete(id);
    }
}

// Singleton instance
const measurementStore = new MeasurementStore();

// Public API
export const measurementService = {
    /**
     * Create a new measurement record
     */
    createMeasurement: async (input: CreateMeasurementInput): Promise<MeasurementRecord> => {
        // Validate input
        if (input.value <= 0) {
            throw new Error('Measurement value must be positive');
        }
        if (!input.materialTypeCode.trim()) {
            throw new Error('Material type code is required');
        }
        if (!input.processStep.trim()) {
            throw new Error('Process step is required');
        }

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));

        return measurementStore.create(input);
    },

    /**
     * Get measurement by ID
     */
    getMeasurementById: async (id: string): Promise<MeasurementRecord | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.getById(id);
    },

    /**
     * Get all measurements with optional filtering
     */
    getMeasurements: async (filter?: MeasurementFilter): Promise<MeasurementRecord[]> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.getAll(filter);
    },

    /**
     * Create a superseding measurement (for corrections)
     */
    supersedeMeasurement: async (
        originalId: string,
        newMeasurement: CreateMeasurementInput
    ): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return measurementStore.supersede(originalId, newMeasurement);
    },

    /**
     * Attach evidence to a measurement
     */
    attachEvidence: async (measurementId: string, evidence: Evidence): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return measurementStore.attachEvidence(measurementId, evidence);
    },

    /**
     * Update validation status
     */
    updateValidationStatus: async (
        measurementId: string,
        status: 'PENDING' | 'VALIDATED' | 'FLAGGED'
    ): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.updateValidationStatus(measurementId, status);
    },

    /**
     * Delete measurement (admin only - for Phase 2)
     */
    deleteMeasurement: async (id: string, adminId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        measurementStore.deleteById(id, adminId);
    },
};
