import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

export interface BankQuestion {
  id: string;
  cursus_id: string;
  question: string;
  question_type: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string;
  correct_options?: string[];
  explanation?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  published?: boolean;
}

const csvEscape = (v: any) => {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function exportBankCsv(items: BankQuestion[], filename = "banque-questions.csv") {
  const header = ["question","option_a","option_b","option_c","option_d","correct_option","difficulty","topic","question_type","explanation"];
  const rows = items.map((q) => header.map((h) => csvEscape((q as any)[h])).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

export function exportBankJson(items: BankQuestion[], filename = "banque-questions.json") {
  const clean = items.map(({ id, cursus_id, ...rest }) => rest);
  download(new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" }), filename);
}

export function exportBankPdf(items: BankQuestion[], title: string, filename = "banque-questions.pdf") {
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text(title, 14, 15);
  doc.setFontSize(10); doc.text(`${items.length} question(s) — IEBC`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["#", "Question", "A", "B", "C", "D", "OK", "Diff."]],
    body: items.map((q, i) => [
      i + 1,
      q.question,
      q.option_a, q.option_b, q.option_c, q.option_d,
      (q.correct_options?.length ? q.correct_options.join(",") : q.correct_option),
      q.difficulty || "-",
    ]),
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 55 } },
  });
  doc.save(filename);
}

export async function exportBankDocx(items: BankQuestion[], title: string, filename = "banque-questions.docx") {
  const children: any[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `${items.length} question(s) — Centre de Formation IEBC`, spacing: { after: 200 } }),
  ];
  items.forEach((q, i) => {
    children.push(new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: `Q${i + 1}. ${q.question}`, bold: true })],
    }));
    (["a","b","c","d"] as const).forEach((k) => {
      const val = (q as any)[`option_${k}`];
      if (!val || val === "—") return;
      children.push(new Paragraph({ text: `${k.toUpperCase()}. ${val}` }));
    });
    const ok = q.correct_options?.length ? q.correct_options.join(", ") : q.correct_option;
    children.push(new Paragraph({
      children: [new TextRun({ text: `Réponse : ${ok}`, italics: true, color: "0F766E" })],
    }));
    if (q.explanation) children.push(new Paragraph({ text: `Explication : ${q.explanation}` }));
  });
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, filename);
}
