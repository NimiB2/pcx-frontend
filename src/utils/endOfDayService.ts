import { BatchRecord } from '../services/batchService';
import { MeasurementRecord } from '../services/measurementService';

export interface DailyBatchStatus {
    batchId: string;
    productName: string;
    status: 'CLOSED' | 'OPEN' | 'OVERDUE';
    totalInputKg: number;
    totalOutputKg: number;
    massBalanceDelta: number;
    massBalanceStatus: 'OK' | 'WARNING' | 'CRITICAL';
    reliabilityScore: 'HIGH' | 'MEDIUM' | 'LOW';
    reliabilityBreakdown: {
        mesCount: number;
        scaleCount: number;
        manualCount: number;
        gpsVerifiedCount: number;
        missingStationsCount: number;
    };
    openExceptions: number;
    creditEligibleKg: number;
    creditsAtRisk: boolean;
}

export interface EndOfDayReport {
    date: Date;
    generatedAt: Date;
    generatedBy: string;
    totalBatchesActive: number;
    totalBatchesClosed: number;
    totalInputKg: number;
    totalOutputKg: number;
    totalCreditEligibleKg: number;
    overallReliabilityScore: 'HIGH' | 'MEDIUM' | 'LOW';
    batches: DailyBatchStatus[];
    exceptions: {
        critical: number;
        warnings: number;
        resolved: number;
    };
    requiresSupervisorSignOff: boolean;
    supervisorSignOff?: {
        signedBy: string;
        signedAt: Date;
        notes: string;
    };
}

export const generateEndOfDayReport = (
    batches: BatchRecord[],
    measurements: MeasurementRecord[],
    targetDate: Date
): EndOfDayReport => {
    // 1. Filter batches active on the target date
    // For simplicity, any batch started on or before the target date, and not completed before the target date.
    // Also consider completed batches today.
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activeBatches = batches.filter(batch => {
        const batchStart = new Date(batch.startDate);
        const batchCompletion = batch.completionDate ? new Date(batch.completionDate) : null;

        if (batchStart > endOfDay) return false;
        if (batchCompletion && batchCompletion < startOfDay) return false;

        return true;
    });

    let totalInputKg = 0;
    let totalOutputKg = 0;
    let totalCreditEligibleKg = 0;
    const dailyStatuses: DailyBatchStatus[] = [];
    let criticalExceptions = 0;
    let warnings = 0;

    for (const batch of activeBatches) {
        // Filter measurements for this batch
        const batchMeasurements = measurements.filter(m => m.batchId === batch.id);

        let mesCount = 0;
        let scaleCount = 0;
        let manualCount = 0;
        let gpsVerifiedCount = 0;

        batchMeasurements.forEach(m => {
            if (m.source === 'MES') mesCount++;
            else if (m.source === 'SCALE') scaleCount++;
            else if (m.source === 'MANUAL') manualCount++;

            // Assuming location metadata implies GPS verification for now, 
            // though actual GPS data depends on implementation.
            if (m.location && m.location.stationId) gpsVerifiedCount++;
        });

        const totalMeasurements = mesCount + scaleCount + manualCount;
        const manualPercentage = totalMeasurements > 0 ? (manualCount / totalMeasurements) * 100 : 0;
        const gpsMissingPercentage = totalMeasurements > 0 ? ((totalMeasurements - gpsVerifiedCount) / totalMeasurements) * 100 : 0;

        // Mass balance
        const inputKg = batch.quantities?.consumed || batch.quantities?.received || 0;
        const yielded = (batch.outputs || []).filter(o => o.type === 'FINAL_PRODUCT').reduce((sum, o) => sum + o.quantityKg, 0);
        const waste = (batch.outputs || []).filter(o => o.type === 'WASTE').reduce((sum, o) => sum + o.quantityKg, 0);
        const returned = batch.quantities?.returned || 0;
        const outputKg = yielded + waste + returned;
        const massBalanceDelta = outputKg - inputKg;

        let massBalanceStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';

        // Define thresholds for mass balance
        // If it's closed, we expect near zero
        // If it's open, Delta could be negative because we haven't yielded everything yet.
        if (batch.status === 'COMPLETED') {
            if (Math.abs(massBalanceDelta) > (inputKg * 0.05)) {
                massBalanceStatus = 'CRITICAL';
                criticalExceptions++;
            } else if (Math.abs(massBalanceDelta) > (inputKg * 0.01)) {
                massBalanceStatus = 'WARNING';
                warnings++;
            }
        }

        // Reliability Score
        let reliabilityScore: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
        const missingStationsCount = 0; // Simplified for MVP if we don't have expected stations

        if (manualPercentage > 40 || gpsMissingPercentage > 50 || massBalanceStatus === 'CRITICAL') {
            reliabilityScore = 'LOW';
        } else if (manualPercentage > 20 || missingStationsCount > 0) {
            reliabilityScore = 'MEDIUM';
        }

        const batchStatusStr = batch.status === 'COMPLETED' ? 'CLOSED' :
            (batch.status === 'OVERDUE_PENDING_APPROVAL' || batch.status === 'APPROVED_OVERDUE') ? 'OVERDUE' : 'OPEN';

        const openExceptionsCount = (massBalanceStatus !== 'OK' ? 1 : 0) + (reliabilityScore === 'LOW' ? 1 : 0);

        // Credit Eligible Logic
        // Final products that are credit-eligible
        const creditEligibleKg = (batch.outputs || [])
            .filter(o => o.type === 'FINAL_PRODUCT' && o.creditEligible)
            .reduce((sum, o) => sum + o.quantityKg, 0);

        const creditsAtRisk = creditEligibleKg > 0 && (massBalanceStatus !== 'OK' || reliabilityScore === 'LOW');

        dailyStatuses.push({
            batchId: batch.id,
            productName: batch.productName,
            status: batchStatusStr,
            totalInputKg: inputKg,
            totalOutputKg: outputKg,
            massBalanceDelta,
            massBalanceStatus,
            reliabilityScore,
            reliabilityBreakdown: {
                mesCount,
                scaleCount,
                manualCount,
                gpsVerifiedCount,
                missingStationsCount
            },
            openExceptions: openExceptionsCount,
            creditEligibleKg,
            creditsAtRisk
        });

        totalInputKg += inputKg;
        totalOutputKg += outputKg;
        totalCreditEligibleKg += creditEligibleKg;
    }

    const requiresSupervisorSignOff = dailyStatuses.some(b =>
        b.massBalanceStatus === 'CRITICAL' || b.creditsAtRisk
    );

    // Calculate overall reliability
    let overallReliabilityScore: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (dailyStatuses.length > 0) {
        const lowCount = dailyStatuses.filter(b => b.reliabilityScore === 'LOW').length;
        const medCount = dailyStatuses.filter(b => b.reliabilityScore === 'MEDIUM').length;

        if (lowCount > 0) {
            overallReliabilityScore = 'LOW';
        } else if (medCount > 0 || dailyStatuses.length === 0) {
            overallReliabilityScore = 'MEDIUM';
        }
    }

    return {
        date: targetDate,
        generatedAt: new Date(),
        generatedBy: 'System', // Would come from auth context
        totalBatchesActive: activeBatches.length,
        totalBatchesClosed: dailyStatuses.filter(b => b.status === 'CLOSED').length,
        totalInputKg,
        totalOutputKg,
        totalCreditEligibleKg,
        overallReliabilityScore,
        batches: dailyStatuses,
        exceptions: {
            critical: criticalExceptions,
            warnings: warnings,
            resolved: 0 // Mock value
        },
        requiresSupervisorSignOff
    };
};
