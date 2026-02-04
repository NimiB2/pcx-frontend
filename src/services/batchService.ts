/**
 * Batch Service - Phase 1 (In-Memory Storage)
 * 
 * This service manages batch records for the PCX system.
 * In Phase 2, this will be replaced with API calls to the backend.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export type BatchStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProductType = 'PELLETS' | 'FLAKES' | 'GRANULES' | 'REGRIND';

export interface MaterialComposition {
    materialTypeCode: string;
    materialTypeName: string;
    classification: 'RECYCLED' | 'VIRGIN' | 'MIXED';
    percentage: number;
}

export interface BatchQuantities {
    expected: number;
    received: number;
    consumed: number;
    yielded: number;
    waste: number;
    unit: 'kg' | 'lbs' | 'ton';
}

export interface BatchRecord {
    id: string;
    status: BatchStatus;
    productName: string;
    productType: ProductType;
    composition: MaterialComposition[];
    quantities: BatchQuantities;
    startDate: Date;
    completionDate: Date | null;
    sourceDocumentId: string | null;
    linkedMeasurementIds: string[];
    notes?: string;
    metadata: {
        supplier?: string;
        lotNumber?: string;
        qualityGrade?: string;
    };
    audit: {
        createdAt: Date;
        createdBy: string;
        lastModifiedAt: Date;
        lastModifiedBy: string;
        version: number;
    };
}

export interface CreateBatchInput {
    productName: string;
    productType: ProductType;
    composition: MaterialComposition[];
    expectedQuantity: number;
    unit: 'kg' | 'lbs' | 'ton';
    startDate: Date;
    sourceDocumentId?: string;
    notes?: string;
    metadata?: {
        supplier?: string;
        lotNumber?: string;
        qualityGrade?: string;
    };
    createdBy: string;
}

export interface BatchFilter {
    status?: BatchStatus;
    productType?: ProductType;
    startDateFrom?: Date;
    startDateTo?: Date;
    materialClassification?: 'RECYCLED' | 'VIRGIN' | 'MIXED';
}

// ============================================================================
// In-Memory Storage Implementation
// ============================================================================

class BatchStore {
    private batches: Map<string, BatchRecord> = new Map();
    private idCounter = 1;

    constructor() {
        this.initializeMockData();
    }

    private generateId(): string {
        const year = new Date().getFullYear();
        const id = `BATCH-${year}-${String(this.idCounter++).padStart(3, '0')}`;
        return id;
    }

    private initializeMockData(): void {
        const mockBatches: Omit<BatchRecord, 'id'>[] = [
            {
                status: 'IN_PROGRESS',
                productName: 'Recycled HDPE Pellets',
                productType: 'PELLETS',
                composition: [
                    {
                        materialTypeCode: 'MAT-R01',
                        materialTypeName: 'Post-Consumer HDPE',
                        classification: 'RECYCLED',
                        percentage: 85,
                    },
                    {
                        materialTypeCode: 'MAT-V02',
                        materialTypeName: 'Virgin HDPE',
                        classification: 'VIRGIN',
                        percentage: 15,
                    },
                ],
                quantities: {
                    expected: 5000,
                    received: 5020,
                    consumed: 3200,
                    yielded: 2800,
                    waste: 150,
                    unit: 'kg',
                },
                startDate: new Date('2026-02-01'),
                completionDate: null,
                sourceDocumentId: 'DOC-2026-001',
                linkedMeasurementIds: [],
                notes: 'High quality batch from supplier A',
                metadata: {
                    supplier: 'EcoPlastics Ltd',
                    lotNumber: 'LOT-2026-Q1-001',
                    qualityGrade: 'A',
                },
                audit: {
                    createdAt: new Date('2026-02-01T08:00:00'),
                    createdBy: 'OP-001',
                    lastModifiedAt: new Date('2026-02-04T10:00:00'),
                    lastModifiedBy: 'OP-002',
                    version: 3,
                },
            },
            {
                status: 'COMPLETED',
                productName: 'Recycled PET Flakes',
                productType: 'FLAKES',
                composition: [
                    {
                        materialTypeCode: 'MAT-R05',
                        materialTypeName: 'Post-Consumer PET',
                        classification: 'RECYCLED',
                        percentage: 100,
                    },
                ],
                quantities: {
                    expected: 3000,
                    received: 2985,
                    consumed: 2985,
                    yielded: 2750,
                    waste: 235,
                    unit: 'kg',
                },
                startDate: new Date('2026-01-25'),
                completionDate: new Date('2026-01-31'),
                sourceDocumentId: 'DOC-2026-002',
                linkedMeasurementIds: [],
                notes: 'Completed successfully',
                metadata: {
                    supplier: 'GreenCycle Inc',
                    lotNumber: 'LOT-2026-Q1-002',
                    qualityGrade: 'A+',
                },
                audit: {
                    createdAt: new Date('2026-01-25T09:00:00'),
                    createdBy: 'OP-001',
                    lastModifiedAt: new Date('2026-01-31T16:30:00'),
                    lastModifiedBy: 'OP-001',
                    version: 5,
                },
            },
            {
                status: 'RECEIVED',
                productName: 'Mixed Plastic Regrind',
                productType: 'REGRIND',
                composition: [
                    {
                        materialTypeCode: 'MAT-M01',
                        materialTypeName: 'Mixed PE/PP',
                        classification: 'MIXED',
                        percentage: 100,
                    },
                ],
                quantities: {
                    expected: 1500,
                    received: 1500,
                    consumed: 0,
                    yielded: 0,
                    waste: 0,
                    unit: 'kg',
                },
                startDate: new Date('2026-02-04'),
                completionDate: null,
                sourceDocumentId: null,
                linkedMeasurementIds: [],
                metadata: {
                    supplier: 'RecycleMart',
                    lotNumber: 'LOT-2026-Q1-003',
                },
                audit: {
                    createdAt: new Date('2026-02-04T07:00:00'),
                    createdBy: 'OP-003',
                    lastModifiedAt: new Date('2026-02-04T07:00:00'),
                    lastModifiedBy: 'OP-003',
                    version: 1,
                },
            },
        ];

        mockBatches.forEach(batch => {
            const id = this.generateId();
            this.batches.set(id, { ...batch, id });
        });
    }

    create(input: CreateBatchInput): BatchRecord {
        const now = new Date();
        const batch: BatchRecord = {
            id: this.generateId(),
            status: 'RECEIVED',
            productName: input.productName,
            productType: input.productType,
            composition: input.composition,
            quantities: {
                expected: input.expectedQuantity,
                received: 0,
                consumed: 0,
                yielded: 0,
                waste: 0,
                unit: input.unit,
            },
            startDate: input.startDate,
            completionDate: null,
            sourceDocumentId: input.sourceDocumentId || null,
            linkedMeasurementIds: [],
            notes: input.notes,
            metadata: input.metadata || {},
            audit: {
                createdAt: now,
                createdBy: input.createdBy,
                lastModifiedAt: now,
                lastModifiedBy: input.createdBy,
                version: 1,
            },
        };

        this.batches.set(batch.id, batch);
        return batch;
    }

    getById(id: string): BatchRecord | null {
        return this.batches.get(id) || null;
    }

    getAll(filter?: BatchFilter): BatchRecord[] {
        let results = Array.from(this.batches.values());

        if (filter) {
            if (filter.status) {
                results = results.filter(b => b.status === filter.status);
            }
            if (filter.productType) {
                results = results.filter(b => b.productType === filter.productType);
            }
            if (filter.startDateFrom) {
                results = results.filter(b => b.startDate >= filter.startDateFrom!);
            }
            if (filter.startDateTo) {
                results = results.filter(b => b.startDate <= filter.startDateTo!);
            }
            if (filter.materialClassification) {
                results = results.filter(b =>
                    b.composition.some(c => c.classification === filter.materialClassification)
                );
            }
        }

        // Sort by start date descending (newest first)
        return results.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }

    updateStatus(id: string, status: BatchStatus, updatedBy: string): BatchRecord | null {
        const batch = this.batches.get(id);
        if (!batch) return null;

        batch.status = status;
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = updatedBy;
        batch.audit.version++;

        if (status === 'COMPLETED' && !batch.completionDate) {
            batch.completionDate = new Date();
        }

        return batch;
    }

    updateQuantities(
        id: string,
        quantities: Partial<Omit<BatchQuantities, 'unit'>>,
        updatedBy: string
    ): BatchRecord | null {
        const batch = this.batches.get(id);
        if (!batch) return null;

        Object.assign(batch.quantities, quantities);
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = updatedBy;
        batch.audit.version++;

        return batch;
    }

    linkMeasurement(batchId: string, measurementId: string, updatedBy: string): BatchRecord | null {
        const batch = this.batches.get(batchId);
        if (!batch) return null;

        if (!batch.linkedMeasurementIds.includes(measurementId)) {
            batch.linkedMeasurementIds.push(measurementId);
            batch.audit.lastModifiedAt = new Date();
            batch.audit.lastModifiedBy = updatedBy;
            batch.audit.version++;
        }

        return batch;
    }

    update(id: string, updates: Partial<BatchRecord>, updatedBy: string): BatchRecord | null {
        const batch = this.batches.get(id);
        if (!batch) return null;

        Object.assign(batch, updates);
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = updatedBy;
        batch.audit.version++;

        return batch;
    }
}

// ============================================================================
// Service Instance
// ============================================================================

const batchStore = new BatchStore();

// ============================================================================
// Public API
// ============================================================================

export const batchService = {
    /**
     * Create a new batch
     */
    async createBatch(input: CreateBatchInput): Promise<BatchRecord> {
        // Validate input
        if (!input.productName.trim()) {
            throw new Error('Product name is required');
        }
        if (input.expectedQuantity <= 0) {
            throw new Error('Expected quantity must be positive');
        }
        if (!input.composition || input.composition.length === 0) {
            throw new Error('At least one material composition is required');
        }

        // Validate composition percentages sum to 100
        const totalPercentage = input.composition.reduce((sum, c) => sum + c.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            throw new Error('Material composition percentages must sum to 100%');
        }

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));

        return batchStore.create(input);
    },

    /**
     * Get batch by ID
     */
    async getBatchById(id: string): Promise<BatchRecord | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return batchStore.getById(id);
    },

    /**
     * Get all batches with optional filtering
     */
    async getBatches(filter?: BatchFilter): Promise<BatchRecord[]> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return batchStore.getAll(filter);
    },

    /**
     * Update batch status
     */
    async updateBatchStatus(
        id: string,
        status: BatchStatus,
        updatedBy: string = 'OP-001'
    ): Promise<BatchRecord> {
        const batch = batchStore.updateStatus(id, status, updatedBy);
        if (!batch) {
            throw new Error(`Batch ${id} not found`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Update batch quantities
     */
    async updateBatchQuantities(
        id: string,
        quantities: Partial<Omit<BatchQuantities, 'unit'>>,
        updatedBy: string = 'OP-001'
    ): Promise<BatchRecord> {
        const batch = batchStore.updateQuantities(id, quantities, updatedBy);
        if (!batch) {
            throw new Error(`Batch ${id} not found`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Link a measurement to a batch
     */
    async linkMeasurementToBatch(
        batchId: string,
        measurementId: string,
        updatedBy: string = 'OP-001'
    ): Promise<BatchRecord> {
        const batch = batchStore.linkMeasurement(batchId, measurementId, updatedBy);
        if (!batch) {
            throw new Error(`Batch ${batchId} not found`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Update batch details
     */
    async updateBatch(
        id: string,
        updates: Partial<BatchRecord>,
        updatedBy: string = 'OP-001'
    ): Promise<BatchRecord> {
        const batch = batchStore.update(id, updates, updatedBy);
        if (!batch) {
            throw new Error(`Batch ${id} not found`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Calculate batch efficiency
     */
    calculateEfficiency(batch: BatchRecord): {
        yieldPercentage: number;
        wastePercentage: number;
        utilizationPercentage: number;
    } {
        const { received, yielded, waste } = batch.quantities;

        if (received === 0) {
            return {
                yieldPercentage: 0,
                wastePercentage: 0,
                utilizationPercentage: 0,
            };
        }

        const yieldPercentage = (yielded / received) * 100;
        const wastePercentage = (waste / received) * 100;
        const utilizationPercentage = ((yielded + waste) / received) * 100;

        return {
            yieldPercentage: Math.round(yieldPercentage * 100) / 100,
            wastePercentage: Math.round(wastePercentage * 100) / 100,
            utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        };
    },

    /**
     * Get recycled content percentage
     */
    getRecycledContentPercentage(batch: BatchRecord): number {
        const recycledPercentage = batch.composition
            .filter(c => c.classification === 'RECYCLED')
            .reduce((sum, c) => sum + c.percentage, 0);

        return Math.round(recycledPercentage * 100) / 100;
    },
};
