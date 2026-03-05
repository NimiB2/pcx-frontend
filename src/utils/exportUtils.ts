// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';
import { EndOfDayReport } from './endOfDayService';

/**
 * Generic function to export an array of objects to a CSV file.
 */
export const exportToCSV = (data: any[], headers: string[], filename: string) => {
    if (data.length === 0) return;

    // Build header row
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";

    // Build data rows
    data.forEach(item => {
        const row = headers.map(header => {
            let val = item[header];
            if (val === null || val === undefined) val = '';
            // Escape quotes and wrap in quotes if there's a comma
            let valStr = String(val).replace(/"/g, '""');
            if (valStr.includes(",") || valStr.includes("\n") || valStr.includes('"')) {
                valStr = `"${valStr}"`;
            }
            return valStr;
        });
        csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportEodToPDF = (eodReport: EndOfDayReport) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text("End of Day Report", 14, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Report Date: ${eodReport.date.toLocaleDateString()}`, 14, yPos);
    yPos += 6;
    doc.text(`Generated At: ${eodReport.generatedAt.toLocaleString()}`, 14, yPos);
    yPos += 10;

    // Summary KPIs
    doc.setFontSize(16);
    doc.text("Summary", 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Total Input: ${eodReport.totalInputKg.toFixed(2)} kg`, 14, yPos);
    yPos += 5;
    doc.text(`Total Output: ${eodReport.totalOutputKg.toFixed(2)} kg`, 14, yPos);
    yPos += 5;
    doc.text(`Credit Eligible: ${eodReport.totalCreditEligibleKg.toFixed(2)} kg`, 14, yPos);
    yPos += 5;
    doc.text(`Overall Reliability: ${eodReport.overallReliabilityScore}`, 14, yPos);
    yPos += 10;

    // Batches
    if (eodReport.batches.length > 0) {
        doc.setFontSize(14);
        doc.text("Batch Reliability", 14, yPos);
        yPos += 4;
        const batchBody = eodReport.batches.map(b => [
            b.batchId,
            b.productName,
            b.totalInputKg.toString(),
            b.totalOutputKg.toString(),
            b.massBalanceDelta.toString(),
            b.reliabilityScore
        ]);
        (doc as any).autoTable({
            startY: yPos,
            head: [['ID', 'Product', 'Input (kg)', 'Output (kg)', 'MB Delta', 'Reliability']],
            body: batchBody,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Exceptions
    const openExceptionsCount = eodReport.exceptions.critical + eodReport.exceptions.warnings;
    if (openExceptionsCount > 0) {
        doc.setFontSize(14);
        doc.text(`Open Exceptions (${openExceptionsCount})`, 14, yPos);
        yPos += 10;
    }

    // Sign-off
    if (eodReport.supervisorSignOff) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("Supervisor Sign-Off", 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`Signed By: ${eodReport.supervisorSignOff.signedBy}`, 14, yPos);
        yPos += 5;
        doc.text(`Signed At: ${eodReport.supervisorSignOff.signedAt.toLocaleString()}`, 14, yPos);
        yPos += 5;
        doc.text(`Notes: ${eodReport.supervisorSignOff.notes}`, 14, yPos);
    }

    doc.save(`EOD_Report_${eodReport.date.toISOString().split('T')[0]}.pdf`);
};
