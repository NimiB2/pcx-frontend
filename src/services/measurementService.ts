// Measurement Service - In-memory implementation for Phase 1
// This will be replaced with API calls in Phase 2

import { GPSTag } from '../utils/gpsService';

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
    gpsTag?: GPSTag;
    reliabilityScore: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOWEST';
    isHistorical?: boolean;
    historicalDate?: Date;
    historicalJustification?: string;
    metadata: {
        entryJustification?: string;
        supersedes?: string | null;
        supersededBy?: string | null;
        notes?: string;
        flags?: string[];
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
    isHistorical?: boolean;
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
    gpsTag?: GPSTag;
    notes?: string;
    entryJustification?: string;
    isHistorical?: boolean;
    historicalDate?: Date;
    historicalJustification?: string;
}

export function calculateReliabilityScore(
    source: string,
    gpsTag?: GPSTag
): 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOWEST' {
    if (source === 'MES') return 'HIGHEST';

    if (source === 'SCALE') {
        return (gpsTag && gpsTag.isWithinRange) ? 'HIGH' : 'MEDIUM';
    }

    if (source === 'MANUAL') {
        return (gpsTag && gpsTag.isWithinRange) ? 'MEDIUM' : 'LOWEST';
    }

    return 'MEDIUM'; // fallback
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
                reliabilityScore: 'HIGH',
                gpsTag: {
                    lat: 34.0522,
                    lng: -118.2437,
                    accuracy: 5,
                    capturedAt: new Date('2026-02-04T08:30:00'),
                    distanceFromStation: 15,
                    isWithinRange: true,
                },
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
                reliabilityScore: 'LOWEST', // manual, no gps
                metadata: {
                    entryJustification: 'Scale temporarily unavailable',
                    notes: 'Virgin material addition for recipe compliance. No GPS — location unverified',
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
                reliabilityScore: 'HIGHEST',
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

        const metadataFlags: string[] = [];
        let notes = input.notes || '';

        if (input.source === 'MANUAL' && !input.gpsTag) {
            notes += (notes ? ' | ' : '') + 'No GPS — location unverified';
        }

        if (input.gpsTag && input.gpsTag.isWithinRange === false) {
            metadataFlags.push('LOCATION_MISMATCH');
        }

        const reliabilityScore = calculateReliabilityScore(input.source, input.gpsTag);

        // Historical entries get a reduced reliability and automatic flag
        if (input.isHistorical) {
            metadataFlags.push('HISTORICAL_ENTRY');
        }

        const measurement: MeasurementRecord = {
            id: this.generateId(),
            source: input.source,
            timestamp: input.isHistorical && input.historicalDate ? input.historicalDate : now,
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
            validationStatus: input.source === 'MANUAL' || input.isHistorical ? 'PENDING' : 'VALIDATED',
            gpsTag: input.gpsTag,
            reliabilityScore: input.isHistorical ? 'LOWEST' : reliabilityScore,
            isHistorical: input.isHistorical || false,
            historicalDate: input.historicalDate,
            historicalJustification: input.historicalJustification,
            metadata: {
                notes: notes,
                entryJustification: input.entryJustification,
                supersedes: null,
                supersededBy: null,
                flags: metadataFlags.length > 0 ? metadataFlags : undefined,
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
            if (filter.isHistorical !== undefined) {
                results = results.filter(m => !!m.isHistorical === filter.isHistorical);
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
     * Creates a new measurement record in the system.
     * 
     * @param {CreateMeasurementInput} input - The details for the new measurement.
     * @returns {Promise<MeasurementRecord>} A promise that resolves to the newly created measurement record.
     * @throws {Error} If validation fails (e.g. negative value, missing material code, missing step).
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
     * Retrieves a measurement record by its unique identifier.
     * 
     * @param {string} id - The unique identifier of the measurement to retrieve.
     * @returns {Promise<MeasurementRecord | undefined>} A promise that resolves to the measurement record if found, or undefined if not.
     */
    getMeasurementById: async (id: string): Promise<MeasurementRecord | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.getById(id);
    },

    /**
     * Retrieves a list of measurement records, optionally filtered by specified criteria.
     * 
     * @param {MeasurementFilter} [filter] - Optional criteria to filter measurements.
     * @returns {Promise<MeasurementRecord[]>} A promise that resolves to an array of matching measurement records.
     */
    getMeasurements: async (filter?: MeasurementFilter): Promise<MeasurementRecord[]> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.getAll(filter);
    },

    /**
     * Creates a new measurement that supersedes an existing one (e.g., for corrections).
     * The original measurement is retained for audit purposes.
     * 
     * @param {string} originalId - The ID of the measurement being superseded.
     * @param {CreateMeasurementInput} newMeasurement - The new replacement measurement details.
     * @returns {Promise<MeasurementRecord>} A promise that resolves to the newly created superseding measurement.
     * @throws {Error} If the original measurement cannot be found.
     */
    supersedeMeasurement: async (
        originalId: string,
        newMeasurement: CreateMeasurementInput
    ): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return measurementStore.supersede(originalId, newMeasurement);
    },

    /**
     * Attaches an evidence record (like a photo or document) to a measurement.
     * 
     * @param {string} measurementId - The ID of the measurement.
     * @param {Evidence} evidence - The evidence metadata to attach.
     * @returns {Promise<MeasurementRecord>} A promise that resolves to the updated measurement record.
     * @throws {Error} If the measurement cannot be found.
     */
    attachEvidence: async (measurementId: string, evidence: Evidence): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return measurementStore.attachEvidence(measurementId, evidence);
    },

    /**
     * Updates the validation status of a measurement.
     * 
     * @param {string} measurementId - The ID of the measurement.
     * @param {'PENDING' | 'VALIDATED' | 'FLAGGED'} status - The new validation status.
     * @returns {Promise<MeasurementRecord>} A promise that resolves to the updated measurement record.
     * @throws {Error} If the measurement cannot be found.
     */
    updateValidationStatus: async (
        measurementId: string,
        status: 'PENDING' | 'VALIDATED' | 'FLAGGED'
    ): Promise<MeasurementRecord> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return measurementStore.updateValidationStatus(measurementId, status);
    },

    /**
     * Deletes a measurement record (requires admin privileges).
     * Note: In a production system, this would likely be a soft delete.
     * 
     * @param {string} id - The ID of the measurement to delete.
     * @param {string} adminId - The ID of the admin performing the deletion (for audit logs).
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     */
    deleteMeasurement: async (id: string, adminId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        measurementStore.deleteById(id, adminId);
    },
};
