// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';
import { BatchRecord, CreditEligibleBreakdown, MaterialComposition } from '../services/batchService';

export interface GPSTag {
    latitude: number;
    longitude: number;
    verified: boolean;
}

export interface Evidence {
    id: string;
    url: string;
    type: 'PHOTO' | 'DOCUMENT';
    timestamp: Date;
}

export interface EvidencePackage {
    packageId: string;
    generatedAt: Date;
    generatedBy: string;
    batch: {
        id: string;
        productName: string;
        startDate: Date;
        completionDate: Date | null;
        vehicleId: string;
        source: 'SUPPLIER' | 'WAREHOUSE';
        supplier?: string;
        lotNumber?: string;
    };
    composition: MaterialComposition[];
    quantities: {
        totalInputKg: number;
        washingLossKg: number;
        finalOutputKg: number;
        wasteKg: number;
        returnedKg: number;
        creditEligibleKg: number;
        rigidCreditKg: number;
        nonRigidCreditKg: number;
    };
    massBalance: {
        status: 'OK' | 'WARNING' | 'CRITICAL';
        delta: number;
        isBalanced: boolean;
    };
    measurements: {
        id: string;
        timestamp: Date;
        station: string;
        processStep: string;
        value: number;
        unit: string;
        source: string;
        reliabilityScore: string;
        gpsTag?: GPSTag;
        evidenceLinks: Evidence[];
    }[];
    discrepancies: {
        id: string;
        type: string;
        severity: string;
        description: string;
        status: string;
        resolution?: string;
    }[];
    creditSummary: CreditEligibleBreakdown;
    supervisorSignOff?: {
        signedBy: string;
        signedAt: Date;
        notes: string;
    };
    overdueApproval?: {
        approvedBy: string;
        approvedAt: Date;
        reason: string;
        daysOpen: number;
    };
}

export const evidencePackageService = {
    /**
     * Builds a complete Evidence Package for a given batch.
     */
    buildEvidencePackage(
        batch: BatchRecord,
        measurements: any[],
        discrepancies: any[]
    ): EvidencePackage {
        // Collect data
        const pkgId = `PKG-${batch.id}-${Date.now().toString().slice(-6)}`;

        // Calculate mass balance
        const totalInput = batch.quantities.received;
        // Approximation: final + waste + returned
        const totalOutput = batch.outputs.filter(o => o.type === 'FINAL_PRODUCT').reduce((sum, o) => sum + o.quantityKg, 0);
        const waste = batch.outputs.filter(o => o.type === 'WASTE').reduce((sum, o) => sum + o.quantityKg, 0);
        const returned = batch.quantities.returned || 0;
        const delta = totalInput - (totalOutput + waste + returned);
        const isBalanced = Math.abs(delta) < 0.01;
        const massBalanceStatus = isBalanced ? 'OK' : (Math.abs(delta) < 50 ? 'WARNING' : 'CRITICAL');

        // Extract credit breakdown
        const creditSummary = batch.creditEligibleInput || {
            rigidKg: 0,
            nonRigidKg: 0,
            totalEligibleKg: 0,
            rigidPercentage: 0,
            nonRigidPercentage: 0
        };

        const pkg: EvidencePackage = {
            packageId: pkgId,
            generatedAt: new Date(),
            generatedBy: 'System User', // Should come from context
            batch: {
                id: batch.id,
                productName: batch.productName,
                startDate: batch.startDate,
                completionDate: batch.completionDate,
                vehicleId: batch.vehicleId,
                source: batch.source,
                supplier: batch.metadata?.supplier,
                lotNumber: batch.metadata?.lotNumber,
            },
            composition: batch.composition,
            quantities: {
                totalInputKg: totalInput,
                washingLossKg: 0, // placeholder
                finalOutputKg: totalOutput,
                wasteKg: waste,
                returnedKg: returned,
                creditEligibleKg: creditSummary.totalEligibleKg,
                rigidCreditKg: creditSummary.rigidKg,
                nonRigidCreditKg: creditSummary.nonRigidKg,
            },
            massBalance: {
                status: massBalanceStatus,
                delta: delta,
                isBalanced: isBalanced,
            },
            measurements: measurements.map(m => ({
                id: m.id,
                timestamp: m.timestamp,
                station: m.station,
                processStep: m.processStep,
                value: m.value,
                unit: m.unit,
                source: m.operator || 'System',
                reliabilityScore: m.status === 'APPROVED' ? 'HIGH' : 'MEDIUM',
                evidenceLinks: [
                    // Mock evidence link if measurement is approved, for testing
                    ...(m.status === 'APPROVED' ? [{
                        id: `EVID-${m.id}`,
                        url: '#',
                        type: 'PHOTO' as const,
                        timestamp: m.timestamp
                    }] : [])
                ]
            })),
            discrepancies: discrepancies.map(d => ({
                id: d.id,
                type: d.type,
                severity: d.severity,
                description: d.description,
                status: d.status,
                resolution: d.resolution,
            })),
            creditSummary: creditSummary,
            overdueApproval: batch.overdueApproval ? {
                approvedBy: batch.overdueApproval.approvedBy || 'Unknown',
                approvedAt: batch.overdueApproval.approvedAt || new Date(),
                reason: batch.overdueApproval.reason,
                daysOpen: batch.overdueApproval.daysOpen
            } : undefined
        };

        return pkg;
    },

    /**
     * Exports the evidence package as a formatted JSON file.
     */
    exportAsJSON(pkg: EvidencePackage) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pkg, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `evidence-${pkg.batch.id}-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    /**
     * Exports the evidence package as a PDF using jsPDF.
     */
    exportAsPDF(pkg: EvidencePackage) {
        const doc = new jsPDF();
        let yPos = 20;

        // Cover Page / Header
        doc.setFontSize(20);
        doc.text("Evidence Package", 14, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Package ID: ${pkg.packageId}`, 14, yPos);
        yPos += 6;
        doc.text(`Generated: ${pkg.generatedAt.toLocaleString()}`, 14, yPos);
        yPos += 10;

        // Batch Info
        doc.setFontSize(16);
        doc.text("Batch Information", 14, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.text(`Batch ID: ${pkg.batch.id}`, 14, yPos);
        yPos += 5;
        doc.text(`Product: ${pkg.batch.productName}`, 14, yPos);
        yPos += 5;
        doc.text(`Source: ${pkg.batch.source}`, 14, yPos);
        yPos += 5;
        doc.text(`Vehicle: ${pkg.batch.vehicleId}`, 14, yPos);
        if (pkg.batch.supplier) {
            yPos += 5;
            doc.text(`Supplier: ${pkg.batch.supplier}`, 14, yPos);
        }
        yPos += 10;

        // Material Composition Table
        doc.setFontSize(14);
        doc.text("Material Composition", 14, yPos);
        yPos += 4;
        const compBody = pkg.composition.map(c => [
            c.materialTypeCode,
            c.materialTypeName,
            c.classification,
            c.rigidity,
            `${c.percentage}%`
        ]);
        (doc as any).autoTable({
            startY: yPos,
            head: [['Code', 'Name', 'Class', 'Rigidity', 'Percentage']],
            body: compBody,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Mass Balance
        doc.setFontSize(14);
        doc.text("Mass Balance & Quantities", 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`Total Input: ${pkg.quantities.totalInputKg} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Final Output: ${pkg.quantities.finalOutputKg} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Waste/Returned: ${pkg.quantities.wasteKg + pkg.quantities.returnedKg} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Delta: ${pkg.massBalance.delta} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Status: ${pkg.massBalance.status}`, 14, yPos);
        yPos += 10;

        // Credit Summary
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Credit Summary", 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`Total Eligible: ${pkg.creditSummary.totalEligibleKg} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Rigid (${pkg.creditSummary.rigidPercentage}%): ${pkg.creditSummary.rigidKg} kg`, 14, yPos);
        yPos += 5;
        doc.text(`Non-Rigid (${pkg.creditSummary.nonRigidPercentage}%): ${pkg.creditSummary.nonRigidKg} kg`, 14, yPos);
        yPos += 15;

        // Measurements Table
        if (yPos > 230) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Measurements", 14, yPos);
        yPos += 4;
        const measBody = pkg.measurements.map(m => [
            m.timestamp.toLocaleString(),
            m.station,
            m.processStep,
            `${m.value} ${m.unit}`,
            m.source,
            `${m.evidenceLinks.length} Files`
        ]);
        (doc as any).autoTable({
            startY: yPos,
            head: [['Time', 'Station', 'Process', 'Value', 'Source', 'Evidence']],
            body: measBody,
            theme: 'grid',
            headStyles: { fillColor: [60, 141, 188] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Discrepancies
        if (pkg.discrepancies.length > 0) {
            if (yPos > 230) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.text("Discrepancies", 14, yPos);
            yPos += 4;
            const discBody = pkg.discrepancies.map(d => [
                d.type,
                d.severity,
                d.status,
                d.description
            ]);
            (doc as any).autoTable({
                startY: yPos,
                head: [['Type', 'Severity', 'Status', 'Description']],
                body: discBody,
                theme: 'grid',
                headStyles: { fillColor: [231, 76, 60] }
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // Supervisor Sign-Off
        if (pkg.overdueApproval || pkg.supervisorSignOff) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.text("Approvals & Sign-Off", 14, yPos);
            yPos += 6;
            doc.setFontSize(10);
            if (pkg.overdueApproval) {
                doc.text(`Overdue Approval By: ${pkg.overdueApproval.approvedBy}`, 14, yPos);
                yPos += 5;
                doc.text(`Date: ${pkg.overdueApproval.approvedAt.toLocaleString()}`, 14, yPos);
                yPos += 5;
                doc.text(`Reason: ${pkg.overdueApproval.reason}`, 14, yPos);
                yPos += 10;
            }
        }

        doc.save(`evidence-${pkg.batch.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    }
};
