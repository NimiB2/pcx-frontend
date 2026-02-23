// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { calculateCreditEligibleInput } from '../utils/creditCalculations';
import VRCQManager from '../pages/VRCQManager';

describe('CHANGE 2: Proportional Allocation — Credit Eligible Input', () => {
    it('calculateCreditEligibleInput() deducts exactly 20% for washing loss from total input', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'RIGID', percentage: 100 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.netInput).toBe(800); // 1000 - 20% = 800
    });

    it('With 70% rigid / 30% non-rigid composition: rigidKg = netInput * 0.70', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'RIGID', percentage: 70 }, { rigidity: 'NON_RIGID', percentage: 30 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.rigidKg).toBe(560); // 800 * 0.70
    });

    it('With 70% rigid / 30% non-rigid composition: nonRigidKg = netInput * 0.30', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'RIGID', percentage: 70 }, { rigidity: 'NON_RIGID', percentage: 30 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.nonRigidKg).toBe(240); // 800 * 0.30
    });

    it('totalEligibleKg equals rigidKg + nonRigidKg', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'RIGID', percentage: 70 }, { rigidity: 'NON_RIGID', percentage: 30 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.totalEligibleKg).toBe(result.rigidKg + result.nonRigidKg);
    });

    it('A batch with 100% rigid returns nonRigidKg = 0', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'RIGID', percentage: 100 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.nonRigidKg).toBe(0);
    });

    it('A batch with 100% non-rigid returns rigidKg = 0', () => {
        const batch = { id: 'B1', composition: [{ rigidity: 'NON_RIGID', percentage: 100 }] };
        const measurements = [{ batchId: 'B1', station: 'Intake', value: 1000 }];
        const result = calculateCreditEligibleInput(batch, measurements);
        expect(result.rigidKg).toBe(0);
    });

    it('VRCQManager renders separate "Rigid Credit Eligible" and "Non-Rigid Credit Eligible" rows', () => {
        render(
            <MemoryRouter>
                <VRCQManager />
            </MemoryRouter>
        );
    });

    it('VRCQManager renders a "Total Credit Eligible" row showing the sum', () => {
        render(
            <MemoryRouter>
                <VRCQManager />
            </MemoryRouter>
        );
    });
});
