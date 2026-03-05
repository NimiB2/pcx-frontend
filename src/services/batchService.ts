/**
 * Batch Service - Phase 1 (In-Memory Storage)
 * 
 * This service manages batch records for the PCX system.
 * In Phase 2, this will be replaced with API calls to the backend.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export type BatchStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE_PENDING_APPROVAL' | 'APPROVED_OVERDUE';
export type ProductType = 'PELLETS' | 'FLAKES' | 'GRANULES' | 'REGRIND';
export type OutputType = 'FINAL_PRODUCT' | 'WASTE' | 'RETURNED_MATERIAL';
export type VRCQApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface VRCQApproval {
    status: VRCQApprovalStatus;
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    notes?: string;
    rejectionReason?: string;
}

export interface CreditEligibleBreakdown {
    rigidKg: number;
    nonRigidKg: number;
    totalEligibleKg: number;
    rigidPercentage: number;
    nonRigidPercentage: number;
}

export interface ReturnedMaterial {
    quantityKg: number;
    rigidPercentage: number;
    nonRigidPercentage: number;
    returnedAt: Date;
    returnedBy: string;
    destinationWarehouse: string;
    sourceBatchId: string;
    newMaterialCode: string;
}

export interface MaterialComposition {
    materialTypeCode: string;
    materialTypeName: string;
    classification: 'RECYCLED' | 'VIRGIN' | 'MIXED';
    rigidity: 'RIGID' | 'NON_RIGID';
    percentage: number;
}

export interface BatchQuantities {
    expected: number;
    received: number;
    consumed: number;
    returned: number;
    unit: 'kg' | 'lbs' | 'ton';
}

export interface BatchOutput {
    id: string;
    type: OutputType;
    quantityKg: number;
    creditEligible: boolean;
    rigidKg: number;
    nonRigidKg: number;
    recordedAt: Date;
    recordedBy: string;
}

export interface BatchRecord {
    id: string;
    status: BatchStatus;
    productName: string;
    productType: ProductType;
    vehicleId: string;
    source: 'SUPPLIER' | 'WAREHOUSE';
    composition: MaterialComposition[];
    quantities: BatchQuantities;
    outputs: BatchOutput[];
    startDate: Date;
    completionDate: Date | null;
    sourceDocumentId: string | null;
    linkedMeasurementIds: string[];
    creditEligibleInput?: CreditEligibleBreakdown;
    overdueApproval?: {
        requestedAt: Date;
        approvedAt?: Date;
        approvedBy?: string;
        reason: string;
        daysOpen: number;
    };
    notes?: string;
    vrcqApproval?: VRCQApproval;
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
    vehicleId: string;
    source: 'SUPPLIER' | 'WAREHOUSE';
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
                status: 'OVERDUE_PENDING_APPROVAL',
                productName: 'Recycled HDPE Pellets',
                productType: 'PELLETS',
                vehicleId: 'TRK-2026-01',
                source: 'SUPPLIER',
                composition: [
                    {
                        materialTypeCode: 'MAT-R01',
                        materialTypeName: 'Post-Consumer HDPE',
                        classification: 'RECYCLED',
                        rigidity: 'RIGID',
                        percentage: 85,
                    },
                    {
                        materialTypeCode: 'MAT-V02',
                        materialTypeName: 'Virgin HDPE',
                        classification: 'VIRGIN',
                        rigidity: 'NON_RIGID',
                        percentage: 15,
                    },
                ],
                quantities: {
                    expected: 5000,
                    received: 5020,
                    consumed: 3200,
                    returned: 250,
                    unit: 'kg',
                },
                outputs: [
                    {
                        id: 'OUT-001',
                        type: 'FINAL_PRODUCT',
                        quantityKg: 2800,
                        creditEligible: true,
                        rigidKg: 2380,
                        nonRigidKg: 420,
                        recordedAt: new Date('2026-02-03T14:00:00'),
                        recordedBy: 'OP-001',
                    },
                    {
                        id: 'OUT-002',
                        type: 'WASTE',
                        quantityKg: 150,
                        creditEligible: false,
                        rigidKg: 0,
                        nonRigidKg: 0,
                        recordedAt: new Date('2026-02-03T15:00:00'),
                        recordedBy: 'OP-001',
                    }
                ],
                startDate: new Date('2026-02-19'),
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
                vehicleId: 'TRK-2026-02',
                source: 'WAREHOUSE',
                composition: [
                    {
                        materialTypeCode: 'MAT-R05',
                        materialTypeName: 'Post-Consumer PET',
                        classification: 'RECYCLED',
                        rigidity: 'RIGID',
                        percentage: 100,
                    },
                ],
                quantities: {
                    expected: 3000,
                    received: 2985,
                    consumed: 2985,
                    returned: 0,
                    unit: 'kg',
                },
                outputs: [
                    {
                        id: 'OUT-003',
                        type: 'FINAL_PRODUCT',
                        quantityKg: 2750,
                        creditEligible: true,
                        rigidKg: 2750,
                        nonRigidKg: 0,
                        recordedAt: new Date('2026-01-31T14:00:00'),
                        recordedBy: 'OP-001',
                    },
                    {
                        id: 'OUT-004',
                        type: 'WASTE',
                        quantityKg: 235,
                        creditEligible: false,
                        rigidKg: 0,
                        nonRigidKg: 0,
                        recordedAt: new Date('2026-01-31T15:00:00'),
                        recordedBy: 'OP-001',
                    }
                ],
                startDate: new Date('2026-01-25'),
                completionDate: new Date('2026-01-31'),
                sourceDocumentId: 'DOC-2026-002',
                linkedMeasurementIds: [],
                notes: 'Completed successfully',
                vrcqApproval: {
                    status: 'PENDING_APPROVAL',
                    requestedAt: new Date('2026-01-31T16:30:00'),
                },
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
                vehicleId: 'TRK-2026-03',
                source: 'SUPPLIER',
                composition: [
                    {
                        materialTypeCode: 'MAT-M01',
                        materialTypeName: 'Mixed PE/PP',
                        classification: 'MIXED',
                        rigidity: 'NON_RIGID',
                        percentage: 100,
                    },
                ],
                quantities: {
                    expected: 1500,
                    received: 1500,
                    consumed: 0,
                    returned: 0,
                    unit: 'kg',
                },
                outputs: [],
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
            vehicleId: input.vehicleId,
            source: input.source,
            composition: input.composition,
            quantities: {
                expected: input.expectedQuantity,
                received: 0,
                consumed: 0,
                returned: 0,
                unit: input.unit,
            },
            outputs: [],
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
     * Creates a new batch record in the system.
     * 
     * @param {CreateBatchInput} input - The standard details for the new batch.
     * @returns {Promise<BatchRecord>} A promise that resolves to the newly created batch record.
     * @throws {Error} If the input validation fails (e.g. missing product name, negative quantity, invalid composition).
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
     * Calculates the number of days a batch has been open.
     * 
     * @param {BatchRecord} batch - The batch record to evaluate.
     * @returns {number} The integer number of days since startDate
     */
    getBatchDaysOpen(batch: BatchRecord): number {
        const now = new Date();
        const start = new Date(batch.startDate);
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Retrieves a batch record by its unique identifier.
     * 
     * @param {string} id - The unique identifier of the batch to retrieve.
     * @returns {Promise<BatchRecord | null>} A promise that resolves to the batch record if found, or null if not found.
     */
    async getBatchById(id: string): Promise<BatchRecord | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return batchStore.getById(id);
    },

    /**
     * Retrieves a list of batch records, optionally sorted and filtered.
     * 
     * @param {BatchFilter} [filter] - Optional criteria to filter the batches (e.g. by status, date range).
     * @returns {Promise<BatchRecord[]>} A promise that resolves to an array of matching batch records.
     */
    async getBatches(filter?: BatchFilter): Promise<BatchRecord[]> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return batchStore.getAll(filter);
    },

    /**
     * Updates the status of an existing batch.
     * 
     * @param {string} id - The unique identifier of the batch.
     * @param {BatchStatus} status - The new status to apply (e.g., 'IN_PROGRESS', 'COMPLETED').
     * @param {string} [updatedBy='OP-001'] - Identifier of the user making the update.
     * @returns {Promise<BatchRecord>} A promise that resolves to the updated batch record.
     * @throws {Error} If the batch with the specified ID cannot be found.
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
     * Updates the recorded quantities for a specific batch.
     * 
     * @param {string} id - The unique identifier of the batch.
     * @param {Partial<Omit<BatchQuantities, 'unit'>>} quantities - The specific quantity fields to update (e.g., received, consumed).
     * @param {string} [updatedBy='OP-001'] - Identifier of the user making the update.
     * @returns {Promise<BatchRecord>} A promise that resolves to the updated batch record.
     * @throws {Error} If the batch with the specified ID cannot be found.
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
     * Links a measurement record to a batch.
     * 
     * @param {string} batchId - The unique identifier of the batch.
     * @param {string} measurementId - The unique identifier of the measurement to link.
     * @param {string} [updatedBy='OP-001'] - Identifier of the user making the link.
     * @returns {Promise<BatchRecord>} A promise that resolves to the updated batch record containing the new link.
     * @throws {Error} If the batch with the specified ID cannot be found.
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
     * Partially updates a batch record with the provided valid fields.
     * 
     * @param {string} id - The unique identifier of the batch.
     * @param {Partial<BatchRecord>} updates - An object containing the fields to update.
     * @param {string} [updatedBy='OP-001'] - Identifier of the user making the update.
     * @returns {Promise<BatchRecord>} A promise that resolves to the fully updated batch record.
     * @throws {Error} If the batch with the specified ID cannot be found.
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
     * Approves the VRCQ for a batch.
     */
    async approveVRCQ(batchId: string, notes: string, reviewedBy: string): Promise<BatchRecord> {
        const batch = batchStore.getById(batchId);
        if (!batch) throw new Error(`Batch ${batchId} not found`);

        batch.vrcqApproval = {
            status: 'APPROVED',
            requestedAt: batch.vrcqApproval?.requestedAt || new Date(),
            reviewedAt: new Date(),
            reviewedBy,
            notes,
        };
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = reviewedBy;
        batch.audit.version++;

        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Rejects the VRCQ for a batch.
     */
    async rejectVRCQ(batchId: string, rejectionReason: string, reviewedBy: string): Promise<BatchRecord> {
        const batch = batchStore.getById(batchId);
        if (!batch) throw new Error(`Batch ${batchId} not found`);

        batch.vrcqApproval = {
            status: 'REJECTED',
            requestedAt: batch.vrcqApproval?.requestedAt || new Date(),
            reviewedAt: new Date(),
            reviewedBy,
            rejectionReason,
        };
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = reviewedBy;
        batch.audit.version++;

        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Submits a batch for VRCQ approval.
     */
    async submitForVRCQApproval(batchId: string, submittedBy: string): Promise<BatchRecord> {
        const batch = batchStore.getById(batchId);
        if (!batch) throw new Error(`Batch ${batchId} not found`);

        batch.vrcqApproval = {
            status: 'PENDING_APPROVAL',
            requestedAt: new Date(),
        };
        batch.audit.lastModifiedAt = new Date();
        batch.audit.lastModifiedBy = submittedBy;
        batch.audit.version++;

        await new Promise(resolve => setTimeout(resolve, 100));
        return batch;
    },

    /**
     * Calculates the operational efficiency metrics for a given batch.
     */
    calculateEfficiency(batch: BatchRecord): {
        yieldPercentage: number;
        wastePercentage: number;
        utilizationPercentage: number;
        isMassBalanceValid: boolean;
    } {
        const { received, returned, consumed } = batch.quantities;
        const yielded = batch.outputs.filter(o => o.type === 'FINAL_PRODUCT').reduce((sum, o) => sum + o.quantityKg, 0);
        const waste = batch.outputs.filter(o => o.type === 'WASTE').reduce((sum, o) => sum + o.quantityKg, 0);

        if (received === 0) {
            return {
                yieldPercentage: 0,
                wastePercentage: 0,
                utilizationPercentage: 0,
                isMassBalanceValid: true,
            };
        }

        const yieldPercentage = (yielded / received) * 100;
        const wastePercentage = (waste / received) * 100;
        const utilizationPercentage = ((yielded + waste + returned) / received) * 100;
        const isMassBalanceValid = Math.abs(yielded + waste + returned - consumed) < 0.01;

        return {
            yieldPercentage: Math.round(yieldPercentage * 100) / 100,
            wastePercentage: Math.round(wastePercentage * 100) / 100,
            utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
            isMassBalanceValid,
        };
    },

    /**
     * Calculates the total percentage of recycled material in the batch composition.
     */
    getRecycledContentPercentage(batch: BatchRecord): number {
        const recycledPercentage = batch.composition
            .filter(c => c.classification === 'RECYCLED')
            .reduce((sum, c) => sum + c.percentage, 0);

        return Math.round(recycledPercentage * 100) / 100;
    },
};
