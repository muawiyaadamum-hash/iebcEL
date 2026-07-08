import jsPDF from "jspdf";
import QRCode from "qrcode";

export type BlockKey =
  | "title"
  | "intro"
  | "name"
  | "body"
  | "cursus"
  | "score"
  | "footer_note"
  | "signature_title"
  | "signature_name"
  | "issued"
  | "code"
  | "verify_hint";

export interface LayoutBlock {
  key: BlockKey;
  x: number;          // % of page width (center point when align=center, left when align=left, right when align=right)
  y: number;          // % of page height (baseline)
  w: number;          // % of page width (max width for wrapping)
  align: "left" | "center" | "right";
  fontSize: number;   // pt
  bold?: boolean;
  italic?: boolean;
  color?: string;     // hex or "primary" | "muted" | "dark"
  underline?: boolean;
  hidden?: boolean;
}

export interface CertificateLayout {
  blocks: LayoutBlock[];
  qr: { x: number; y: number; size: number; hidden?: boolean; hint?: boolean };
  // Optional white "readability" panel under the whole content when a bg image is present
  panel?: { x: number; y: number; w: number; h: number; opacity: number; showBorder?: boolean };
  // Optional soft bottom band to guarantee no overlap in the footer zone
  bottomBand?: { y: number; h: number; opacity: number };
}

export const DEFAULT_CERTIFICATE_LAYOUT: CertificateLayout = {
  panel: { x: 8, y: 22, w: 84, h: 56, opacity: 0.82, showBorder: true },
  bottomBand: { y: 78, h: 20, opacity: 0.92 },
  blocks: [
    { key: "title",           x: 50, y: 30, w: 90, align: "center", fontSize: 26, bold: true, color: "primary" },
    { key: "intro",           x: 50, y: 36, w: 60, align: "center", fontSize: 12, color: "muted" },
    { key: "name",            x: 50, y: 43, w: 70, align: "center", fontSize: 26, bold: true, color: "dark", underline: true },
    { key: "body",            x: 50, y: 50, w: 80, align: "center", fontSize: 12, color: "muted" },
    { key: "cursus",          x: 50, y: 56, w: 80, align: "center", fontSize: 16, bold: true, color: "primary" },
    { key: "score",           x: 50, y: 62, w: 80, align: "center", fontSize: 11, color: "muted" },
    { key: "footer_note",     x: 50, y: 67, w: 75, align: "center", fontSize: 9, color: "muted" },

    // Bottom zone — three columns, no overlap
    { key: "issued",          x: 8,  y: 84, w: 26, align: "left",   fontSize: 10, color: "muted" },
    { key: "code",            x: 8,  y: 88, w: 26, align: "left",   fontSize: 10, color: "muted" },
    { key: "verify_hint",     x: 8,  y: 92, w: 26, align: "left",   fontSize: 9,  color: "muted", italic: true },

    { key: "signature_title", x: 50, y: 84, w: 30, align: "center", fontSize: 11, italic: true, color: "dark" },
    { key: "signature_name",  x: 50, y: 92, w: 30, align: "center", fontSize: 11, bold: true, color: "dark" },
  ],
  qr: { x: 82, y: 79, size: 12, hint: true },
};

export interface CertificateTemplate {
  header_title?: string;
  institution_name?: string;
  institution_subtitle?: string;
  signatory_name?: string;
  signatory_title?: string;
  footer_text?: string;
  primary_color?: string;
  background_image_url?: string | null;
  layout?: CertificateLayout | null;
}

export interface CertificateData {
  code: string;
  studentName: string;
  cursusTitle: string;
  score: number;
  total: number;
  issuedAt: string;
  verifyUrl: string;
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

export function resolveBlockText(key: BlockKey, data: CertificateData): string {
  const tpl = data.template || {};
  switch (key) {
    case "title": return tpl.header_title || "CERTIFICAT DE RÉUSSITE";
    case "intro": return "Décerné à";
    case "name": return data.studentName;
    case "body": return "Pour avoir suivi avec succès et validé l'évaluation finale du cursus";
    case "cursus": return data.cursusTitle;
    case "score": {
      const hasBreakdown = data.combinedPercent !== undefined && data.projectGrade !== undefined;
      if (hasBreakdown) return `Note finale : ${data.combinedPercent}%  ·  Projet 40% : ${data.projectGrade}/100  ·  QCM 60% : ${data.qcmScore}/${data.qcmTotal}`;
      if (data.total > 0) {
        const pct = Math.round((data.score / data.total) * 100);
        return `Score obtenu : ${data.score} / ${data.total} (${pct}%)`;
      }
      return "";
    }
    case "footer_note": return tpl.footer_text || "";
    case "signature_title": return tpl.signatory_title || "Direction Pédagogique";
    case "signature_name": return tpl.signatory_name || tpl.institution_name || "Centre de Formation IEBC";
    case "issued": {
      const issued = new Date(data.issuedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      return `Délivré le ${issued}`;
    }
    case "code": return `Réf. : ${data.code}`;
    case "verify_hint": {
      try {
        const u = new URL(data.verifyUrl);
        return `Vérifiez sur ${u.host}`;
      } catch { return "Certificat vérifiable en ligne"; }
    }
  }
}

export async function generateCertificatePdf(data: CertificateData): Promise<jsPDF> {
  const tpl = data.template || {};
  const layout = tpl.layout || DEFAULT_CERTIFICATE_LAYOUT;
  const [pr, pg, pb] = hexToRgb(tpl.primary_color || "#0F4C81");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const bg = tpl.background_image_url;
  if (bg) {
    try {
      const fmt = bg.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(bg, fmt, 0, 0, w, h);
    } catch (e) {
      console.warn("Certificate background failed to load", e);
    }
    // Readability panel over background
    if (layout.panel) {
      const p = layout.panel;
      doc.setGState(doc.GState({ opacity: p.opacity }));
      doc.setFillColor(255, 255, 255);
      doc.roundedRect((p.x / 100) * w, (p.y / 100) * h, (p.w / 100) * w, (p.h / 100) * h, 10, 10, "F");
      doc.setGState(doc.GState({ opacity: 1 }));
      if (p.showBorder) {
        doc.setDrawColor(pr, pg, pb);
        doc.setLineWidth(0.8);
        doc.roundedRect((p.x / 100) * w, (p.y / 100) * h, (p.w / 100) * w, (p.h / 100) * h, 10, 10);
      }
    }
    // Bottom band ensures footer stays readable and separated from ornaments
    if (layout.bottomBand) {
      const b = layout.bottomBand;
      doc.setGState(doc.GState({ opacity: b.opacity }));
      doc.setFillColor(255, 255, 255);
      doc.rect(0, (b.y / 100) * h, w, (b.h / 100) * h, "F");
      doc.setGState(doc.GState({ opacity: 1 }));
      // Thin accent line at top of band
      doc.setDrawColor(pr, pg, pb);
      doc.setLineWidth(0.4);
      doc.line(w * 0.06, (b.y / 100) * h, w * 0.94, (b.y / 100) * h);
    }
  } else {
    // Framed variant (no background image)
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(4);
    doc.rect(24, 24, w - 48, h - 48);
    doc.setLineWidth(0.6);
    doc.rect(34, 34, w - 68, h - 68);
    doc.setFillColor(pr, pg, pb);
    doc.rect(34, 34, w - 68, 60, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(tpl.institution_name || "Centre de Formation IEBC", w / 2, 66, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    if (tpl.institution_subtitle) doc.text(tpl.institution_subtitle, w / 2, 84, { align: "center" });
  }

  // Render each layout block
  for (const block of layout.blocks) {
    if (block.hidden) continue;
    const text = resolveBlockText(block.key, data);
    if (!text) continue;

    // Color resolution
    if (block.color === "primary") doc.setTextColor(pr, pg, pb);
    else if (block.color === "muted") doc.setTextColor(90);
    else if (block.color === "dark" || !block.color) doc.setTextColor(20);
    else {
      const [r, g, b] = hexToRgb(block.color);
      doc.setTextColor(r, g, b);
    }

    const weight = block.bold && block.italic ? "bolditalic" : block.bold ? "bold" : block.italic ? "italic" : "normal";
    doc.setFont("helvetica", weight as any);
    doc.setFontSize(block.fontSize);

    const xPt = (block.x / 100) * w;
    const yPt = (block.y / 100) * h;
    const maxW = (block.w / 100) * w;

    doc.text(text, xPt, yPt, { align: block.align, maxWidth: maxW });

    if (block.underline) {
      // Draw underline: measure text width (jsPDF returns for current font settings)
      const tw = Math.min(doc.getTextWidth(text), maxW);
      let lineX1 = xPt, lineX2 = xPt + tw;
      if (block.align === "center") { lineX1 = xPt - tw / 2; lineX2 = xPt + tw / 2; }
      else if (block.align === "right") { lineX1 = xPt - tw; lineX2 = xPt; }
      doc.setDrawColor(pr, pg, pb);
      doc.setLineWidth(1);
      doc.line(lineX1, yPt + 6, lineX2, yPt + 6);
    }

    // Signature separator line under signature_title
    if (block.key === "signature_title") {
      doc.setDrawColor(pr, pg, pb);
      doc.setLineWidth(0.8);
      const half = Math.min(maxW / 2, 90);
      doc.line(xPt - half, yPt + 10, xPt + half, yPt + 10);
    }
  }

  // QR
  if (!layout.qr.hidden) {
    const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 0, width: 220 });
    const qrSize = (layout.qr.size / 100) * w;
    const qrX = (layout.qr.x / 100) * w;
    const qrY = (layout.qr.y / 100) * h;
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    if (layout.qr.hint !== false) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Scannez pour vérifier", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" });
    }
  }

  return doc;
}
