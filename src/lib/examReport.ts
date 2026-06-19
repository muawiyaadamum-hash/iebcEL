import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExamReviewItem {
  id: string;
  question: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  given: string;
  correct: string;
  ok: boolean;
  explanation: string | null;
}

export interface ExamReportData {
  studentName: string;
  cursusTitle: string;
  attemptId: string;
  score: number;
  total: number;
  passed: boolean;
  submittedAt: string;
  review: ExamReviewItem[];
}

export function generateExamReportPdf(data: ExamReportData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(15, 76, 129);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Centre de Formation IEBC", margin, 35);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Rapport d'évaluation - QCM", margin, 55);

  doc.setTextColor(0);
  let y = 110;
  doc.setFontSize(11);
  doc.text(`Apprenant : ${data.studentName}`, margin, y); y += 16;
  doc.text(`Cursus : ${data.cursusTitle}`, margin, y); y += 16;
  doc.text(`Date : ${new Date(data.submittedAt).toLocaleString("fr-FR")}`, margin, y); y += 16;
  doc.text(`Réf. tentative : ${data.attemptId}`, margin, y); y += 24;

  // Score box
  const boxX = margin;
  const boxY = y;
  const boxW = pageWidth - margin * 2;
  const boxH = 60;
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(1);
  doc.roundedRect(boxX, boxY, boxW, boxH, 6, 6);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.passed ? 22 : 180, data.passed ? 140 : 30, data.passed ? 60 : 40);
  doc.text(`Score : ${data.score} / ${data.total}`, boxX + 16, boxY + 32);
  doc.setFontSize(12);
  doc.text(data.passed ? "ADMIS" : "NON ADMIS", boxX + 16, boxY + 50);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const pct = Math.round((data.score / Math.max(data.total, 1)) * 100);
  doc.text(`Pourcentage : ${pct}%`, boxX + boxW - 140, boxY + 32);
  doc.text(`Seuil de réussite : 60%`, boxX + boxW - 140, boxY + 50);

  // Detail table
  autoTable(doc, {
    startY: boxY + boxH + 24,
    margin: { left: margin, right: margin },
    head: [["#", "Question", "Votre réponse", "Correcte", "Statut"]],
    body: data.review.map((r, i) => [
      String(i + 1),
      r.question.length > 90 ? r.question.slice(0, 87) + "…" : r.question,
      r.given || "-",
      r.correct,
      r.ok ? "✓" : "✗",
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 76, 129] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 70, halign: "center" },
      3: { cellWidth: 60, halign: "center" },
      4: { cellWidth: 40, halign: "center" },
    },
    didParseCell: (hook) => {
      if (hook.section === "body" && hook.column.index === 4) {
        const ok = data.review[hook.row.index]?.ok;
        hook.cell.styles.textColor = ok ? [22, 140, 60] : [180, 30, 40];
        hook.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Centre de Formation IEBC — Document généré automatiquement — Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  return doc;
}
