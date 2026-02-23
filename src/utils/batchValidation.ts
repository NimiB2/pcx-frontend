import { BatchRecord, batchService } from '../services/batchService';

export interface OverdueCheckResult {
    batchId: string;
    daysOpen: number;
    blockedActions: string[];
}

/**
 * Checks all batches for overdue status.
 * If a batch is IN_PROGRESS and has been open for > 2 days, it auto-flags it.
 */
export const checkBatchOverdueStatus = async (batches: BatchRecord[]): Promise<OverdueCheckResult[]> => {
    const overdueResults: OverdueCheckResult[] = [];

    for (const batch of batches) {
        if (batch.status === 'IN_PROGRESS') {
            const daysOpen = batchService.getBatchDaysOpen(batch);
            if (daysOpen > 2 && !batch.overdueApproval?.approvedAt) {
                // Automatically flag as overdue
                await batchService.updateBatchStatus(batch.id, 'OVERDUE_PENDING_APPROVAL', 'SYSTEM');

                await batchService.updateBatch(batch.id, {
                    overdueApproval: {
                        requestedAt: new Date(),
                        reason: '', // Blank initially, filled by supervisor
                        daysOpen: daysOpen,
                    }
                }, 'SYSTEM');

                overdueResults.push({
                    batchId: batch.id,
                    daysOpen,
                    blockedActions: ['RECORD_OUTPUT', 'CLOSE_BATCH']
                });
            }
        } else if (batch.status === 'OVERDUE_PENDING_APPROVAL') {
            const daysOpen = batchService.getBatchDaysOpen(batch);
            overdueResults.push({
                batchId: batch.id,
                daysOpen,
                blockedActions: ['RECORD_OUTPUT', 'CLOSE_BATCH']
            });
        }
    }

    return overdueResults;
};
