const generateId = (length: number) => Math.random().toString(36).substring(2, 2 + length).toUpperCase();

export type DocumentType = 'License' | 'Permit' | 'Certificate' | 'Policy' | 'Evidence' | 'Other';
export type DocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface DocumentVersion {
    id: string;
    versionNumber: number;
    fileName: string;
    uploadDate: Date;
    uploadedBy: string;
    fileSize: number;
    notes?: string;
}

export interface DocumentRecord {
    id: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    expiryDate?: Date;
    currentVersion: number;
    versions: DocumentVersion[];
}

export interface CreateDocumentInput {
    name: string;
    type: DocumentType;
    expiryDate?: Date;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    notes?: string;
}

export interface UpdateDocumentVersionInput {
    documentId: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    expiryDate?: Date;
    notes?: string;
}

class DocumentStore {
    private documents: DocumentRecord[] = [
        {
            id: 'DOC-1001',
            name: 'Operating License 2026',
            type: 'License',
            status: 'VALID',
            expiryDate: new Date('2026-12-31'),
            currentVersion: 1,
            versions: [
                {
                    id: 'DOC-1001-v1',
                    versionNumber: 1,
                    fileName: 'license_2026_signed.pdf',
                    uploadDate: new Date('2025-12-15T10:00:00Z'),
                    uploadedBy: 'admin',
                    fileSize: 1024 * 1024 * 2.5,
                }
            ]
        },
        {
            id: 'DOC-1002',
            name: 'ISO 14001 Certification',
            type: 'Certificate',
            status: 'VALID',
            expiryDate: new Date('2027-05-15'),
            currentVersion: 2,
            versions: [
                {
                    id: 'DOC-1002-v1',
                    versionNumber: 1,
                    fileName: 'iso_14001_initial.pdf',
                    uploadDate: new Date('2024-05-15T10:00:00Z'),
                    uploadedBy: 'admin',
                    fileSize: 1024 * 1024 * 1.5,
                    notes: 'Initial certification'
                },
                {
                    id: 'DOC-1002-v2',
                    versionNumber: 2,
                    fileName: 'iso_14001_renewed.pdf',
                    uploadDate: new Date('2026-01-10T10:00:00Z'),
                    uploadedBy: 'admin',
                    fileSize: 1024 * 1024 * 1.8,
                    notes: 'Renewal after audit'
                }
            ]
        },
        {
            id: 'DOC-1003',
            name: 'Scale Calibration - Line A',
            type: 'Certificate',
            status: 'EXPIRING_SOON',
            expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            currentVersion: 1,
            versions: [
                {
                    id: 'DOC-1003-v1',
                    versionNumber: 1,
                    fileName: 'calib_report_lineA.pdf',
                    uploadDate: new Date('2025-03-10T10:00:00Z'),
                    uploadedBy: 'admin',
                    fileSize: 1024 * 1024 * 0.8,
                }
            ]
        },
        {
            id: 'DOC-1004',
            name: 'Fire Safety Clearance',
            type: 'Permit',
            status: 'EXPIRED',
            expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            currentVersion: 1,
            versions: [
                {
                    id: 'DOC-1004-v1',
                    versionNumber: 1,
                    fileName: 'fire_safety_2025.pdf',
                    uploadDate: new Date('2025-01-10T10:00:00Z'),
                    uploadedBy: 'admin',
                    fileSize: 1024 * 1024 * 1.2,
                }
            ]
        }
    ];

    private subscribers: ((docs: DocumentRecord[]) => void)[] = [];

    // Helper: dynamic status calculation based on expiry date
    private calculateStatus(expiryDate?: Date): DocumentStatus {
        if (!expiryDate) return 'VALID'; // No expiry means valid indefinitely

        const now = new Date();
        const daysToExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (daysToExpiry < 0) return 'EXPIRED';
        if (daysToExpiry <= 30) return 'EXPIRING_SOON';
        return 'VALID';
    }

    private updateStatuses() {
        let changed = false;
        this.documents.forEach(doc => {
            const newStatus = this.calculateStatus(doc.expiryDate);
            if (doc.status !== newStatus) {
                doc.status = newStatus;
                changed = true;
            }
        });
        if (changed) this.notifySubscribers();
    }

    constructor() {
        // Initial check and regular interval check
        this.updateStatuses();
        setInterval(() => this.updateStatuses(), 1000 * 60 * 60 * 24); // Daily update
    }

    public subscribe(callback: (docs: DocumentRecord[]) => void) {
        this.subscribers.push(callback);
        callback([...this.documents]);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    private notifySubscribers() {
        const copy = [...this.documents];
        this.subscribers.forEach(cb => cb(copy));
    }

    public getAll(): DocumentRecord[] {
        return [...this.documents];
    }

    public getById(id: string): DocumentRecord | undefined {
        return this.documents.find(d => d.id === id);
    }

    public create(input: CreateDocumentInput): DocumentRecord {
        const newId = `DOC-${generateId(4)}`;

        const newVersion: DocumentVersion = {
            id: `${newId}-v1`,
            versionNumber: 1,
            fileName: input.fileName,
            uploadDate: new Date(),
            uploadedBy: input.uploadedBy,
            fileSize: input.fileSize,
            notes: input.notes
        };

        const newDoc: DocumentRecord = {
            id: newId,
            name: input.name,
            type: input.type,
            status: this.calculateStatus(input.expiryDate),
            expiryDate: input.expiryDate,
            currentVersion: 1,
            versions: [newVersion]
        };

        this.documents = [newDoc, ...this.documents];
        this.notifySubscribers();
        return newDoc;
    }

    public addVersion(input: UpdateDocumentVersionInput): DocumentRecord {
        const docIndex = this.documents.findIndex(d => d.id === input.documentId);
        if (docIndex === -1) throw new Error('Document not found');

        const doc = this.documents[docIndex];
        const nextVersionNum = doc.currentVersion + 1;

        const newVersion: DocumentVersion = {
            id: `${doc.id}-v${nextVersionNum}`,
            versionNumber: nextVersionNum,
            fileName: input.fileName,
            uploadDate: new Date(),
            uploadedBy: input.uploadedBy,
            fileSize: input.fileSize,
            notes: input.notes
        };

        const updatedDoc: DocumentRecord = {
            ...doc,
            currentVersion: nextVersionNum,
            // If new expiry is provided, update it and recal status
            expiryDate: input.expiryDate !== undefined ? input.expiryDate : doc.expiryDate,
            status: input.expiryDate !== undefined ? this.calculateStatus(input.expiryDate) : this.calculateStatus(doc.expiryDate),
            versions: [newVersion, ...doc.versions].sort((a, b) => b.versionNumber - a.versionNumber) // keep newest first
        };

        this.documents[docIndex] = updatedDoc;
        this.notifySubscribers();
        return updatedDoc;
    }

    public delete(id: string): void {
        this.documents = this.documents.filter(d => d.id !== id);
        this.notifySubscribers();
    }
}

export const documentService = new DocumentStore();
