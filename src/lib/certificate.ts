import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface CertificateData {
  code: string;
  studentName: string;
  cursusTitle: string;
  score: number;
  total: number;
  issuedAt: string;
  verifyUrl: string;
}

export function generateCertificateCode(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `IEBC-${t}-${r}`;
}

export async function generateCertificatePdf(data: CertificateData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Outer frame
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(4);
  doc.rect(24, 24, w - 48, h - 48);
  doc.setLineWidth(0.6);
  doc.rect(34, 34, w - 68, h - 68);

  // Header band
  doc.setFillColor(15, 76, 129);
  doc.rect(34, 34, w - 68, 70, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Centre de Formation IEBC", w / 2, 70, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Institut d'Excellence pour le Business et les Compétences", w / 2, 92, { align: "center" });

  // Title
  doc.setTextColor(15, 76, 129);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("CERTIFICAT DE RÉUSSITE", w / 2, 160, { align: "center" });

  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Décerné à", w / 2, 200, { align: "center" });

  // Student name
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(data.studentName, w / 2, 240, { align: "center" });

  // Line under name
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(1);
  doc.line(w / 2 - 180, 252, w / 2 + 180, 252);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(60);
  doc.text(
    "Pour avoir suivi avec succès et validé l'évaluation finale du cursus",
    w / 2,
    285,
    { align: "center" },
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 76, 129);
  doc.text(data.cursusTitle, w / 2, 315, { align: "center" });

  // Score
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(60);
  const pct = Math.round((data.score / data.total) * 100);
  doc.text(`Score obtenu : ${data.score} / ${data.total} (${pct}%)`, w / 2, 345, { align: "center" });

  // Footer left: date + code
  doc.setFontSize(10);
  doc.setTextColor(80);
  const issued = new Date(data.issuedAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.text(`Délivré le ${issued}`, 80, h - 90);
  doc.text(`Réf. : ${data.code}`, 80, h - 72);
  doc.text(`Vérification : ${data.verifyUrl}`, 80, h - 54);

  // Signature
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text("Direction Pédagogique", w / 2, h - 72, { align: "center" });
  doc.line(w / 2 - 90, h - 80, w / 2 + 90, h - 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Centre de Formation IEBC", w / 2, h - 56, { align: "center" });

  // QR code (right)
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 0, width: 220 });
  const qrSize = 110;
  doc.addImage(qrDataUrl, "PNG", w - 80 - qrSize, h - 90 - qrSize + 30, qrSize, qrSize);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Scannez pour vérifier", w - 80 - qrSize / 2, h - 50, { align: "center" });

  return doc;
}
