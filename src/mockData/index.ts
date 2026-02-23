export const mockUser = {
    id: '1',
    email: 'operator@aterum.com',
    role: 'operator',
    name: 'John Operator',
    tenantId: 'tenant-1',
};

export const mockMeasurements = [
    {
        id: 'MR-2026-001',
        timestamp: new Date('2026-02-02T08:30:00'),
        station: 'Intake Station',
        processStep: 'Material Receipt - Ready for Production',
        value: 500.5,
        unit: 'kg',
        materialType: 'RECYCLED',
        materialCode: 'MAT-001',
        operator: 'John Operator',
        batchId: 'BATCH-2026-001',
        status: 'APPROVED',
        gpsTag: {
            lat: 34.0522,
            lng: -118.2437,
            accuracy: 5,
            capturedAt: new Date('2026-02-02T08:30:00'),
            distanceFromStation: 15,
            isWithinRange: true,
        },
    },
    {
        id: 'MR-2026-002',
        timestamp: new Date('2026-02-02T09:15:00'),
        station: 'Mixing Station',
        processStep: 'Before Mixing',
        value: 450.2,
        unit: 'kg',
        materialType: 'VIRGIN',
        materialCode: 'MAT-002',
        operator: 'John Operator',
        batchId: 'BATCH-2026-001',
        status: 'PENDING',
        // GPS missing (manual entry, no GPS)
    },
    {
        id: 'MR-2026-003',
        timestamp: new Date('2026-02-02T10:45:00'),
        station: 'Extrusion Station',
        processStep: 'After Extrusion',
        value: 850.0,
        unit: 'kg',
        materialType: 'MIXED',
        materialCode: 'PROD-001',
        operator: 'Jane Smith',
        batchId: 'BATCH-2026-001',
        status: 'APPROVED',
        gpsTag: {
            lat: 34.0560,
            lng: -118.2437,
            accuracy: 10,
            capturedAt: new Date('2026-02-02T10:45:00'),
            distanceFromStation: 420, // out of range mismatch
            isWithinRange: false,
        },
    },
];

export const mockBatches = [
    {
        id: 'BATCH-2026-001',
        type: 'PRODUCTION',
        status: 'OVERDUE_PENDING_APPROVAL',
        productCode: 'PROD-001',
        productName: 'Recycled Polyethylene Film',
        vehicleId: 'TRK-2026-01',
        source: 'SUPPLIER',
        rigidity: 'RIGID',
        recycledPercentage: 65.5,
        startDate: new Date('2026-02-19T08:00:00'), // 4 days ago
        targetQuantity: 1000,
        currentQuantity: 850,
        returnedQuantity: 150,
        operator: 'John Operator',
    },
    {
        id: 'BATCH-2026-002',
        type: 'PRODUCTION',
        status: 'COMPLETED',
        productCode: 'PROD-002',
        productName: 'Virgin PET Bottles',
        vehicleId: 'TRK-2026-02',
        source: 'WAREHOUSE',
        rigidity: 'RIGID',
        recycledPercentage: 0,
        startDate: new Date('2026-02-01T08:00:00'),
        completedDate: new Date('2026-02-01T16:00:00'),
        targetQuantity: 500,
        currentQuantity: 500,
        operator: 'Jane Smith',
    },
    {
        id: 'BATCH-2026-003',
        type: 'PRODUCTION',
        status: 'PENDING',
        productCode: 'PROD-001',
        productName: 'Recycled Polyethylene Film',
        vehicleId: 'TRK-2026-03',
        source: 'SUPPLIER',
        rigidity: 'NON_RIGID',
        recycledPercentage: 70.0,
        startDate: new Date('2026-02-03T08:00:00'),
        targetQuantity: 800,
        currentQuantity: 0,
        operator: 'Unassigned',
    },
];

export const mockVRCQs = [
    {
        id: 'VRCQ-001',
        batchId: 'BATCH-2026-002',
        productionPeriod: {
            start: new Date('2026-02-01T08:00:00'),
            end: new Date('2026-02-01T16:00:00'),
        },
        finishedProduct: {
            type: 'Virgin PET Bottles',
            quantity: 500,
            unit: 'kg',
        },
        recycledContent: {
            percentage: 0,
            quantity: 0,
        },
        creditEligibleInput: {
            rigidKg: 340,
            nonRigidKg: 120,
            totalEligibleKg: 460,
            rigidPercentage: 70,
            nonRigidPercentage: 30,
        },
        allocationStatus: 'AVAILABLE',
        remainingQuantity: 0,
    },
    {
        id: 'VRCQ-002',
        batchId: 'BATCH-2026-001',
        productionPeriod: {
            start: new Date('2026-02-02T08:00:00'),
            end: new Date('2026-02-02T14:00:00'),
        },
        finishedProduct: {
            type: 'Recycled Polyethylene Film',
            quantity: 850,
            unit: 'kg',
        },
        recycledContent: {
            percentage: 65.5,
            quantity: 556.75,
        },
        creditEligibleInput: {
            rigidKg: 340,
            nonRigidKg: 120,
            totalEligibleKg: 460,
            rigidPercentage: 70,
            nonRigidPercentage: 30,
        },
        allocationStatus: 'PARTIALLY_ALLOCATED',
        allocatedQuantity: 200,
        remainingQuantity: 356.75,
    },
];

export const mockDiscrepancies = [
    {
        id: 'DISC-001',
        type: 'MASS_BALANCE',
        severity: 'HIGH',
        description: 'Input-output mismatch',
        batchId: 'BATCH-2026-001',
        expectedValue: 1000,
        actualValue: 950,
        difference: -50,
        unit: 'kg',
        detected: new Date('2026-02-02T11:00:00'),
        status: 'OPEN',
        slaDeadline: new Date('2026-02-03T11:00:00'),
    },
    {
        id: 'DISC-002',
        type: 'VALIDATION',
        severity: 'MEDIUM',
        description: 'Missing scale reading at Extrusion Station',
        batchId: 'BATCH-2026-001',
        detected: new Date('2026-02-02T09:30:00'),
        status: 'RESOLVED',
        resolvedAt: new Date('2026-02-02T10:15:00'),
        resolution: 'Manual entry added and verified by supervisor',
    },
    {
        id: 'DISC-003',
        type: 'CREDITS_AT_RISK',
        severity: 'HIGH',
        description: 'Output exceeds input (mass balance violation)',
        batchId: 'BATCH-2026-003',
        detected: new Date('2026-02-03T09:30:00'),
        status: 'OPEN',
        slaDeadline: new Date('2026-02-04T09:30:00'),
    },
];

export const mockCodebook = [
    { code: 'CUST-A001', realIdentity: 'Acme Corporation', type: 'CUSTOMER', status: 'ACTIVE' },
    { code: 'CUST-B002', realIdentity: 'Beta Industries', type: 'CUSTOMER', status: 'ACTIVE' },
    { code: 'SUP-001', realIdentity: 'Recycling Supply Co.', type: 'SUPPLIER', status: 'ACTIVE' },
    { code: 'MAT-001', realIdentity: 'Post-Consumer HDPE', type: 'MATERIAL', status: 'ACTIVE' },
    { code: 'MAT-002', realIdentity: 'Virgin LDPE Pellets', type: 'MATERIAL', status: 'ACTIVE' },
    { code: 'PROD-001', realIdentity: 'Recycled Polyethylene Film', type: 'MATERIAL', status: 'ACTIVE' },
    { code: 'PROD-002', realIdentity: 'Virgin PET Bottles', type: 'MATERIAL', status: 'ACTIVE' },
];

export const mockDocuments = [
    {
        id: 'DOC-001',
        name: 'ISO 14001 Certificate',
        type: 'CERTIFICATION',
        uploadDate: new Date('2025-12-01'),
        expiryDate: new Date('2026-12-01'),
        status: 'VALID',
        fileUrl: '/mock/iso-certificate.pdf',
    },
    {
        id: 'DOC-002',
        name: 'PCX Audit Report Q4 2025',
        type: 'AUDIT',
        uploadDate: new Date('2026-01-15'),
        status: 'VALID',
        fileUrl: '/mock/audit-report.pdf',
    },
    {
        id: 'DOC-003',
        name: 'Material Safety Data Sheet - HDPE',
        type: 'SAFETY',
        uploadDate: new Date('2025-11-20'),
        expiryDate: new Date('2026-05-15'),
        status: 'EXPIRING_SOON',
        fileUrl: '/mock/msds-hdpe.pdf',
    },
];

export const mockPunchListTasks = [
    {
        id: 'TASK-001',
        title: 'Complete Q1 2026 Evidence Package',
        description: 'Compile all documentation for Q1 certification',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: 'Supervisor Team',
        dueDate: new Date('2026-03-31'),
        dependencies: [],
        progress: 60,
    },
    {
        id: 'TASK-002',
        title: 'Verify Scale Calibrations',
        description: 'Ensure all weighing scales are calibrated',
        priority: 'MEDIUM',
        status: 'PENDING',
        assignedTo: 'Maintenance',
        dueDate: new Date('2026-02-15'),
        dependencies: [],
        progress: 0,
    },
    {
        id: 'TASK-003',
        title: 'Review MES Integration Logs',
        description: 'Check for any integration errors in the past month',
        priority: 'LOW',
        status: 'COMPLETED',
        assignedTo: 'IT Team',
        dueDate: new Date('2026-02-01'),
        completedDate: new Date('2026-01-30'),
        dependencies: [],
        progress: 100,
    },
];

export const mockReturnedMaterials = [
    {
        quantityKg: 150,
        rigidPercentage: 85,
        nonRigidPercentage: 15,
        returnedAt: new Date('2026-02-04T12:00:00'),
        returnedBy: 'John Operator',
        destinationWarehouse: 'WH-South',
        sourceBatchId: 'BATCH-2026-001',
        newMaterialCode: 'MAT-RET-001'
    }
];

export const mockCreditSummary = {
    totalEligibleKg: 12400,
    totalRigidKg: 8680,
    totalNonRigidKg: 3720,
    flaggedKg: 1200,
    flaggedPercentage: 9.7,
    completionPercentage: 24.8,
    annualTargetKg: 50000,
    projectedYearEndKg: 41600
};

export const mockMonthlyCredits = [
    { month: 'Jan', actual: 4000, projected: 4000, isProjected: false },
    { month: 'Feb', actual: 4400, projected: 4400, isProjected: false },
    { month: 'Mar', actual: 4000, projected: 4600, isProjected: true },
    { month: 'Apr', actual: 0, projected: 4500, isProjected: true },
    { month: 'May', actual: 0, projected: 4700, isProjected: true },
    { month: 'Jun', actual: 0, projected: 4800, isProjected: true },
    { month: 'Jul', actual: 0, projected: 4600, isProjected: true },
    { month: 'Aug', actual: 0, projected: 4900, isProjected: true },
    { month: 'Sep', actual: 0, projected: 5000, isProjected: true },
    { month: 'Oct', actual: 0, projected: 4800, isProjected: true },
    { month: 'Nov', actual: 0, projected: 5100, isProjected: true },
    { month: 'Dec', actual: 0, projected: 5000, isProjected: true },
];

export const mockLeaderboard = [
    // Operators
    {
        userId: '1', // Matches the mockUser id so it shows up for the logged-in operator
        userName: 'John Operator',
        role: 'operator' as const,
        rank: 1,
        totalScore: 142,
        weeklyTrend: 'UP' as const,
        breakdown: { basePoints: 100, accuracyBonus: 20, speedBonus: 12, gpsBonus: 10, approvalsBonus: 0, slaBonus: 0, penalties: 0 },
        stats: { entriesCount: 28, validatedCount: 26, gpsVerifiedCount: 25, flaggedCount: 1 }
    },
    {
        userId: 'OP-002',
        userName: 'Maria Lopez',
        role: 'operator' as const,
        rank: 2,
        totalScore: 125,
        weeklyTrend: 'STABLE' as const,
        breakdown: { basePoints: 90, accuracyBonus: 15, speedBonus: 10, gpsBonus: 10, approvalsBonus: 0, slaBonus: 0, penalties: 0 },
        stats: { entriesCount: 24, validatedCount: 22, gpsVerifiedCount: 20, flaggedCount: 0 }
    },
    {
        userId: 'OP-003',
        userName: 'David Smith',
        role: 'operator' as const,
        rank: 3,
        totalScore: 98,
        weeklyTrend: 'DOWN' as const,
        breakdown: { basePoints: 80, accuracyBonus: 10, speedBonus: 5, gpsBonus: 8, approvalsBonus: 0, slaBonus: 0, penalties: -5 },
        stats: { entriesCount: 20, validatedCount: 15, gpsVerifiedCount: 10, flaggedCount: 3 }
    },
    {
        userId: 'OP-004',
        userName: 'Emma Johnson',
        role: 'operator' as const,
        rank: 4,
        totalScore: 85,
        weeklyTrend: 'STABLE' as const,
        breakdown: { basePoints: 70, accuracyBonus: 10, speedBonus: 5, gpsBonus: 0, approvalsBonus: 0, slaBonus: 0, penalties: 0 },
        stats: { entriesCount: 18, validatedCount: 16, gpsVerifiedCount: 5, flaggedCount: 0 }
    },

    // Supervisors
    {
        userId: 'SUP-001',
        userName: 'Sarah Supervisor',
        role: 'supervisor' as const,
        rank: 1,
        totalScore: 118,
        weeklyTrend: 'UP' as const,
        breakdown: { basePoints: 80, accuracyBonus: 0, speedBonus: 0, gpsBonus: 0, approvalsBonus: 25, slaBonus: 13, penalties: 0 },
        stats: { approvalsOnTime: 8, discrepanciesClosed: 5 }
    },
    {
        userId: 'SUP-002',
        userName: 'Michael Chang',
        role: 'supervisor' as const,
        rank: 2,
        totalScore: 95,
        weeklyTrend: 'DOWN' as const,
        breakdown: { basePoints: 80, accuracyBonus: 0, speedBonus: 0, gpsBonus: 0, approvalsBonus: 15, slaBonus: 10, penalties: -10 },
        stats: { approvalsOnTime: 4, discrepanciesClosed: 3 }
    },

    // Auditors
    {
        userId: 'AUD-001',
        userName: 'Mike Auditor',
        role: 'auditor' as const,
        rank: 1,
        totalScore: 95,
        weeklyTrend: 'UP' as const,
        breakdown: { basePoints: 60, accuracyBonus: 0, speedBonus: 0, gpsBonus: 0, approvalsBonus: 0, slaBonus: 35, penalties: 0 },
        stats: { discrepanciesClosed: 7, flaggedResolved: 4, signoffs: 12 }
    },
    {
        userId: 'AUD-002',
        userName: 'Jessica Kim',
        role: 'auditor' as const,
        rank: 2,
        totalScore: 82,
        weeklyTrend: 'STABLE' as const,
        breakdown: { basePoints: 50, accuracyBonus: 0, speedBonus: 0, gpsBonus: 0, approvalsBonus: 0, slaBonus: 32, penalties: 0 },
        stats: { discrepanciesClosed: 5, flaggedResolved: 3, signoffs: 9 }
    }
];

export const mockEndOfDayReport = {
    date: new Date('2026-02-23T00:00:00'),
    generatedAt: new Date('2026-02-23T17:00:00'),
    generatedBy: 'System',
    totalBatchesActive: 3,
    totalBatchesClosed: 1,
    totalInputKg: 4500,
    totalOutputKg: 4280,
    totalCreditEligibleKg: 2960,
    overallReliabilityScore: 'MEDIUM',
    batches: [
        {
            batchId: 'BATCH-2026-003',
            productName: 'Virgin PET Bottles',
            status: 'CLOSED',
            totalInputKg: 1000,
            totalOutputKg: 995,
            massBalanceDelta: -5,
            massBalanceStatus: 'OK',
            reliabilityScore: 'HIGH',
            reliabilityBreakdown: {
                mesCount: 15,
                scaleCount: 5,
                manualCount: 0,
                gpsVerifiedCount: 20,
                missingStationsCount: 0,
            },
            openExceptions: 0,
            creditEligibleKg: 0,
            creditsAtRisk: false,
        },
        {
            batchId: 'BATCH-2026-004',
            productName: 'Recycled Polyethylene Film',
            status: 'OPEN',
            totalInputKg: 2000,
            totalOutputKg: 1800,
            massBalanceDelta: -200,
            massBalanceStatus: 'WARNING',
            reliabilityScore: 'MEDIUM',
            reliabilityBreakdown: {
                mesCount: 10,
                scaleCount: 8,
                manualCount: 6,
                gpsVerifiedCount: 22,
                missingStationsCount: 0,
            },
            openExceptions: 1,
            creditEligibleKg: 1500,
            creditsAtRisk: true,
        },
        {
            batchId: 'BATCH-2026-005',
            productName: 'Recycled HDPE Pellets',
            status: 'OVERDUE',
            totalInputKg: 1500,
            totalOutputKg: 1485,
            massBalanceDelta: -15,
            massBalanceStatus: 'CRITICAL',
            reliabilityScore: 'LOW',
            reliabilityBreakdown: {
                mesCount: 5,
                scaleCount: 2,
                manualCount: 10,
                gpsVerifiedCount: 5,
                missingStationsCount: 1,
            },
            openExceptions: 2,
            creditEligibleKg: 1460,
            creditsAtRisk: true,
        }
    ],
    exceptions: {
        critical: 1,
        warnings: 2,
        resolved: 3
    },
    requiresSupervisorSignOff: true
};

export const mockEvidencePackage = {
    packageId: 'PKG-BATCH-2026-001-123456',
    generatedAt: new Date('2026-02-23T17:00:00'),
    generatedBy: 'Sarah Supervisor',
    batch: {
        id: 'BATCH-2026-001',
        productName: 'Recycled Polyethylene Film',
        startDate: new Date('2026-02-19T08:00:00'),
        completionDate: new Date('2026-02-23T14:00:00'),
        vehicleId: 'TRK-2026-01',
        source: 'SUPPLIER',
        supplier: 'EcoPlastics Ltd',
        lotNumber: 'LOT-2026-Q1-001'
    },
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
        }
    ],
    quantities: {
        totalInputKg: 5020,
        washingLossKg: 0,
        finalOutputKg: 2800,
        wasteKg: 150,
        returnedKg: 250,
        creditEligibleKg: 2800,
        rigidCreditKg: 2380,
        nonRigidCreditKg: 420
    },
    massBalance: {
        status: 'WARNING',
        delta: 1820,
        isBalanced: false
    },
    measurements: [
        {
            id: '1',
            timestamp: new Date('2026-02-02T08:30:00'),
            station: 'Intake Station',
            processStep: 'Material Receipt - Ready for Production',
            value: 500.5,
            unit: 'kg',
            source: 'John Operator',
            reliabilityScore: 'HIGH',
            gpsTag: { latitude: 34.0522, longitude: -118.2437, verified: true },
            evidenceLinks: [
                { id: 'EVID-1A', url: '/mock/photo1.jpg', type: 'PHOTO', timestamp: new Date('2026-02-02T08:30:00') },
                { id: 'EVID-1B', url: '/mock/doc1.pdf', type: 'DOCUMENT', timestamp: new Date('2026-02-02T08:30:00') }
            ]
        },
        {
            id: '2',
            timestamp: new Date('2026-02-02T09:15:00'),
            station: 'Mixing Station',
            processStep: 'Before Mixing',
            value: 450.2,
            unit: 'kg',
            source: 'John Operator',
            reliabilityScore: 'MEDIUM',
            evidenceLinks: []
        }
    ],
    discrepancies: [
        {
            id: 'DISC-001',
            type: 'MASS_BALANCE',
            severity: 'HIGH',
            description: 'Input-output mismatch',
            status: 'OPEN'
        },
        {
            id: 'DISC-002',
            type: 'VALIDATION',
            severity: 'MEDIUM',
            description: 'Missing scale reading at Extrusion Station',
            status: 'RESOLVED',
            resolution: 'Manual entry added and verified by supervisor'
        }
    ],
    creditSummary: {
        totalEligibleKg: 2800,
        rigidKg: 2380,
        nonRigidKg: 420,
        rigidPercentage: 85,
        nonRigidPercentage: 15
    },
    overdueApproval: {
        approvedBy: 'Sarah Supervisor',
        approvedAt: new Date('2026-02-23T16:00:00'),
        reason: 'Delayed due to missing scale calibration at Mixing Station',
        daysOpen: 4
    }
};
