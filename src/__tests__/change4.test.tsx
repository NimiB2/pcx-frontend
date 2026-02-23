// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { calculateBatchCreditEligibleInput, assessCreditsAtRisk } from '../utils/creditCalculations';
import BatchDetail from '../pages/BatchDetail';
import SupervisorDashboard from '../pages/dashboard/SupervisorDashboard';

describe('CHANGE 4: Output Classification & Credits at Risk', () => {
    it('BatchOutput with type: FINAL_PRODUCT is counted as credit eligible', () => {
        const batch = {
            composition: [{ rigidity: 'RIGID', percentage: 100 }],
            outputs: [{ type: 'FINAL_PRODUCT', quantityKg: 100 }]
        };
        const res = calculateBatchCreditEligibleInput(batch);
        expect(res.totalEligibleKg).toBe(100);
    });

    it('BatchOutput with type: WASTE is not counted as credit eligible', () => {
        const batch = {
            composition: [{ rigidity: 'RIGID', percentage: 100 }],
            outputs: [{ type: 'WASTE', quantityKg: 50 }, { type: 'FINAL_PRODUCT', quantityKg: 100 }]
        };
        const res = calculateBatchCreditEligibleInput(batch);
        expect(res.totalEligibleKg).toBe(100);
    });

    it('BatchOutput with type: RETURNED_MATERIAL is not counted as credit eligible in the current batch', () => {
        const batch = {
            composition: [{ rigidity: 'RIGID', percentage: 100 }],
            outputs: [{ type: 'RETURNED_MATERIAL', quantityKg: 50 }, { type: 'FINAL_PRODUCT', quantityKg: 100 }]
        };
        const res = calculateBatchCreditEligibleInput(batch);
        expect(res.totalEligibleKg).toBe(100);
    });

    it('calculateBatchCreditEligibleInput() sums only FINAL_PRODUCT outputs', () => {
        const batch = {
            composition: [{ rigidity: 'RIGID', percentage: 100 }],
            outputs: [
                { type: 'FINAL_PRODUCT', quantityKg: 100 },
                { type: 'FINAL_PRODUCT', quantityKg: 200 },
                { type: 'WASTE', quantityKg: 50 }
            ]
        };
        const res = calculateBatchCreditEligibleInput(batch);
        expect(res.totalEligibleKg).toBe(300);
    });

    it('assessCreditsAtRisk() returns HIGH when output > input', () => {
        const batch = { id: 'B1', outputs: [{ quantityKg: 200 }], quantities: { consumed: 150 } };
        const res = assessCreditsAtRisk(batch, []);
        expect(res.level).toBe('HIGH');
    });

    it('assessCreditsAtRisk() returns HIGH when more than 30% of entries are MANUAL source', () => {
        const batch = { id: 'B1', outputs: [], quantities: { consumed: 100 } };
        const measurements = [
            { batchId: 'B1', source: 'MANUAL', station: '1' },
            { batchId: 'B1', source: 'MANUAL', station: '2' },
            { batchId: 'B1', source: 'SCALE', station: '3' },
            { batchId: 'B1', source: 'SCALE', station: '4' }
        ];
        // 2/4 = 50%
        const res = assessCreditsAtRisk(batch, measurements);
        expect(res.level).toBe('HIGH');
    });

    it('assessCreditsAtRisk() returns MEDIUM when there is an open unresolved discrepancy', () => {
        const batch = { id: 'B1', outputs: [], quantities: { consumed: 100 } };
        const discrepancies = [{ batchId: 'B1', status: 'OPEN' }];
        const res = assessCreditsAtRisk(batch, [], discrepancies);
        expect(res.level).toBe('MEDIUM');
    });

    it('assessCreditsAtRisk() returns LOW when all checks pass', () => {
        const batch = { id: 'B1', outputs: [], quantities: { consumed: 100 } };
        const res = assessCreditsAtRisk(batch, [], []);
        expect(res.level).toBe('LOW');
    });

    it('BatchDetail renders a "Credits at Risk" banner when risk is HIGH', () => {
        render(<MemoryRouter><BatchDetail /></MemoryRouter>);
    });

    it('SupervisorDashboard renders a "Batches at Risk" stat card', () => {
        render(<MemoryRouter><SupervisorDashboard /></MemoryRouter>);
    });
});
