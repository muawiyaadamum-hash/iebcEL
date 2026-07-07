import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface CertificateTemplate {
  header_title?: string;
  institution_name?: string;
  institution_subtitle?: string;
  signatory_name?: string;
  signatory_title?: string;
  footer_text?: string;
  primary_color?: string;
}

export interface CertificateData {
  code: string;
  studentName: string;
  cursusTitle: string;
  score: number;
  total: number;
  issuedAt: string;
  verifyUrl: string;
  // Optional 40/60 breakdown
  qcmScore?: number;
  qcmTotal?: number;
  projectGrade?: number;
  combinedPercent?: number;
  template?: CertificateTemplate | null;
}

export function generateCertificateCode(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `IEBC-${t}-${r}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export async function generateCertificatePdf(data: CertificateData): Promise<jsPDF> {
  const tpl = data.template || {};
  const [pr, pg, pb] = hexToRgb(tpl.primary_color || "#0F4C81");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Frames
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(4);
  doc.rect(24, 24, w - 48, h - 48);
  doc.setLineWidth(0.6);
  doc.rect(34, 34, w - 68, h - 68);

  // Header band
  doc.setFillColor(pr, pg, pb);
  doc.rect(34, 34, w - 68, 70, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(tpl.institution_name || "Centre de Formation IEBC", w / 2, 70, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (tpl.institution_subtitle) {
    doc.text(tpl.institution_subtitle, w / 2, 92, { align: "center" });
  }

  // Title
  doc.setTextColor(pr, pg, pb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text(tpl.header_title || "CERTIFICAT DE RÉUSSITE", w / 2, 160, { align: "center" });

  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Décerné à", w / 2, 200, { align: "center" });

  // Name
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(data.studentName, w / 2, 240, { align: "center" });
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(1);
  doc.line(w / 2 - 180, 252, w / 2 + 180, 252);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(60);
  doc.text("Pour avoir suivi avec succès et validé l'évaluation finale du cursus", w / 2, 285, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(pr, pg, pb);
  doc.text(data.cursusTitle, w / 2, 315, { align: "center" });

  // Breakdown 40/60
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60);
  const hasBreakdown = data.combinedPercent !== undefined && data.projectGrade !== undefined;
  if (hasBreakdown) {
    doc.text(
      `Note finale : ${data.combinedPercent}%  ·  Projet 40% : ${data.projectGrade}/100  ·  QCM 60% : ${data.qcmScore}/${data.qcmTotal}`,
      w / 2,
      345,
      { align: "center" }
    );
  } else {
    const pct = Math.round((data.score / data.total) * 100);
    doc.text(`Score obtenu : ${data.score} / ${data.total} (${pct}%)`, w / 2, 345, { align: "center" });
  }

  // Footer text
  if (tpl.footer_text) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(tpl.footer_text, w / 2, 375, { align: "center", maxWidth: w - 200 });
  }

  // Footer left
  doc.setFontSize(10);
  doc.setTextColor(80);
  const issued = new Date(data.issuedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Délivré le ${issued}`, 80, h - 90);
  doc.text(`Réf. : ${data.code}`, 80, h - 72);
  doc.text(`Vérification : ${data.verifyUrl}`, 80, h - 54);

  // Signature
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text(tpl.signatory_title || "Direction Pédagogique", w / 2, h - 88, { align: "center" });
  doc.line(w / 2 - 90, h - 78, w / 2 + 90, h - 78);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(tpl.signatory_name || "Centre de Formation IEBC", w / 2, h - 62, { align: "center" });

  // QR
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 0, width: 220 });
  const qrSize = 110;
  doc.addImage(qrDataUrl, "PNG", w - 80 - qrSize, h - 90 - qrSize + 30, qrSize, qrSize);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Scannez pour vérifier", w - 80 - qrSize / 2, h - 50, { align: "center" });

  return doc;
}
