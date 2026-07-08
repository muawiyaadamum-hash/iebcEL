import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { RotateCcw, Save, Eye, EyeOff, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import {
  CertificateLayout,
  DEFAULT_CERTIFICATE_LAYOUT,
  LayoutBlock,
  BlockKey,
  resolveBlockText,
  CertificateData,
} from "@/lib/certificate";

interface Props {
  value?: CertificateLayout | null;
  onChange: (layout: CertificateLayout) => void;
  backgroundUrl?: string | null;
  primaryColor?: string;
  sampleData: CertificateData;
}

const BLOCK_LABELS: Record<BlockKey, string> = {
  title: "Titre",
  intro: "Décerné à",
  name: "Nom du laureat",
  body: "Phrase d'introduction",
  cursus: "Cursus / Programme",
  score: "Note / Score",
  footer_note: "Mention légale",
  signature_title: "Titre signataire",
  signature_name: "Nom signataire",
  issued: "Date de délivrance",
  code: "Référence",
  verify_hint: "Vérification (texte)",
};

// A4 landscape ratio
const RATIO = 842 / 595;

const clone = (l: CertificateLayout): CertificateLayout => JSON.parse(JSON.stringify(l));

const CertificateLayoutEditor = ({ value, onChange, backgroundUrl, primaryColor = "#0F4C81", sampleData }: Props) => {
  const [layout, setLayout] = useState<CertificateLayout>(value ? clone(value) : clone(DEFAULT_CERTIFICATE_LAYOUT));
  const [selectedKey, setSelectedKey] = useState<BlockKey | "qr" | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; key: BlockKey | "qr" } | null>(null);

  const commit = (next: CertificateLayout) => {
    setLayout(next);
    onChange(next);
  };

  const selected: LayoutBlock | null = useMemo(() => {
    if (!selectedKey || selectedKey === "qr") return null;
    return layout.blocks.find((b) => b.key === selectedKey) || null;
  }, [selectedKey, layout]);

  const updateBlock = (key: BlockKey, patch: Partial<LayoutBlock>) => {
    commit({ ...layout, blocks: layout.blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)) });
  };

  const updateQr = (patch: Partial<CertificateLayout["qr"]>) => {
    commit({ ...layout, qr: { ...layout.qr, ...patch } });
  };

  const onMouseDown = (e: React.MouseEvent, key: BlockKey | "qr") => {
    e.stopPropagation();
    setSelectedKey(key);
    const isQr = key === "qr";
    const b = isQr ? null : layout.blocks.find((x) => x.key === key);
    if (!b && !isQr) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: isQr ? layout.qr.x : b!.x,
      origY: isQr ? layout.qr.y : b!.y,
      key,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    const s = dragState.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dxPct = ((e.clientX - s.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - s.startY) / rect.height) * 100;
    let nx = Math.max(0, Math.min(100, s.origX + dxPct));
    let ny = Math.max(0, Math.min(100, s.origY + dyPct));
    // snap 0.5
    nx = Math.round(nx * 2) / 2;
    ny = Math.round(ny * 2) / 2;
    if (s.key === "qr") {
      setLayout((l) => ({ ...l, qr: { ...l.qr, x: nx, y: ny } }));
    } else {
      setLayout((l) => ({ ...l, blocks: l.blocks.map((b) => (b.key === s.key ? { ...b, x: nx, y: ny } : b)) }));
    }
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    if (dragState.current) {
      // commit current state
      setLayout((l) => {
        onChange(l);
        return l;
      });
    }
    dragState.current = null;
  };

  const reset = () => {
    if (!confirm("Réinitialiser la mise en page par défaut ?")) return;
    commit(clone(DEFAULT_CERTIFICATE_LAYOUT));
    setSelectedKey(null);
  };

  const colorFor = (block: LayoutBlock) => {
    if (block.color === "primary") return primaryColor;
    if (block.color === "muted") return "#666";
    if (block.color === "dark" || !block.color) return "#111";
    return block.color;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">Cliquez et glissez chaque bloc sur l'aperçu. Sélectionnez un bloc pour éditer sa typographie à droite.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-1" />Réinitialiser</Button>
          </div>
        </div>
        <div
          ref={canvasRef}
          className="relative w-full border rounded-md overflow-hidden bg-white shadow-inner select-none"
          style={{ aspectRatio: `${RATIO}`, backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
          onClick={() => setSelectedKey(null)}
        >
          {/* Panel overlay */}
          {backgroundUrl && layout.panel && (
            <div className="absolute pointer-events-none rounded"
              style={{
                left: `${layout.panel.x}%`, top: `${layout.panel.y}%`,
                width: `${layout.panel.w}%`, height: `${layout.panel.h}%`,
                background: `rgba(255,255,255,${layout.panel.opacity})`,
                border: layout.panel.showBorder ? `1px solid ${primaryColor}` : "none",
              }}
            />
          )}
          {/* Bottom band */}
          {backgroundUrl && layout.bottomBand && (
            <div className="absolute pointer-events-none left-0 right-0"
              style={{
                top: `${layout.bottomBand.y}%`,
                height: `${layout.bottomBand.h}%`,
                background: `rgba(255,255,255,${layout.bottomBand.opacity})`,
                borderTop: `1px solid ${primaryColor}`,
              }}
            />
          )}

          {/* Blocks */}
          {layout.blocks.map((b) => {
            const text = resolveBlockText(b.key, sampleData) || `[${BLOCK_LABELS[b.key]}]`;
            const isSelected = selectedKey === b.key;
            const align = b.align;
            const transform = align === "center" ? "translate(-50%, -50%)" : align === "right" ? "translate(-100%, -50%)" : "translate(0, -50%)";
            return (
              <div
                key={b.key}
                onMouseDown={(e) => onMouseDown(e, b.key)}
                className={`absolute cursor-move whitespace-pre-wrap ${b.hidden ? "opacity-30" : ""} ${isSelected ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"}`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  transform,
                  textAlign: align,
                  fontSize: `${b.fontSize * 0.75}px`,  // preview scale
                  fontWeight: b.bold ? 700 : 400,
                  fontStyle: b.italic ? "italic" : "normal",
                  color: colorFor(b),
                  textDecoration: b.underline ? "underline" : undefined,
                  lineHeight: 1.2,
                  padding: "1px 2px",
                }}
              >
                {text}
              </div>
            );
          })}

          {/* QR */}
          {!layout.qr.hidden && (
            <div
              onMouseDown={(e) => onMouseDown(e, "qr")}
              className={`absolute cursor-move flex items-center justify-center bg-black/80 text-white text-[8px] ${selectedKey === "qr" ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-primary/40"}`}
              style={{ left: `${layout.qr.x}%`, top: `${layout.qr.y}%`, width: `${layout.qr.size}%`, aspectRatio: "1", }}
            >
              QR
            </div>
          )}
        </div>
      </div>

      <Card className="p-3 space-y-3">
        {!selected && selectedKey !== "qr" && (
          <div className="text-sm text-muted-foreground">
            Sélectionnez un bloc sur l'aperçu pour éditer.
            <ul className="mt-3 space-y-1 text-xs">
              {layout.blocks.map((b) => (
                <li key={b.key}>
                  <button className={`w-full text-left px-2 py-1 rounded hover:bg-muted ${b.hidden ? "text-muted-foreground line-through" : ""}`} onClick={() => setSelectedKey(b.key)}>
                    {BLOCK_LABELS[b.key]}
                  </button>
                </li>
              ))}
              <li>
                <button className={`w-full text-left px-2 py-1 rounded hover:bg-muted ${layout.qr.hidden ? "text-muted-foreground line-through" : ""}`} onClick={() => setSelectedKey("qr")}>
                  QR code
                </button>
              </li>
            </ul>
          </div>
        )}

        {selected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{BLOCK_LABELS[selected.key]}</div>
              <Button size="icon" variant="ghost" onClick={() => updateBlock(selected.key, { hidden: !selected.hidden })}>
                {selected.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><Label className="text-xs">X %</Label><Input type="number" value={selected.x} step={0.5} onChange={(e) => updateBlock(selected.key, { x: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Y %</Label><Input type="number" value={selected.y} step={0.5} onChange={(e) => updateBlock(selected.key, { y: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">L %</Label><Input type="number" value={selected.w} step={1} onChange={(e) => updateBlock(selected.key, { w: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label className="text-xs">Taille de police ({selected.fontSize}pt)</Label>
              <Slider min={6} max={48} step={1} value={[selected.fontSize]} onValueChange={([v]) => updateBlock(selected.key, { fontSize: v })} />
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant={selected.bold ? "default" : "outline"} onClick={() => updateBlock(selected.key, { bold: !selected.bold })}><Bold className="h-3 w-3" /></Button>
              <Button size="sm" variant={selected.italic ? "default" : "outline"} onClick={() => updateBlock(selected.key, { italic: !selected.italic })}><Italic className="h-3 w-3" /></Button>
              <div className="flex-1" />
              <Button size="sm" variant={selected.align === "left" ? "default" : "outline"} onClick={() => updateBlock(selected.key, { align: "left" })}><AlignLeft className="h-3 w-3" /></Button>
              <Button size="sm" variant={selected.align === "center" ? "default" : "outline"} onClick={() => updateBlock(selected.key, { align: "center" })}><AlignCenter className="h-3 w-3" /></Button>
              <Button size="sm" variant={selected.align === "right" ? "default" : "outline"} onClick={() => updateBlock(selected.key, { align: "right" })}><AlignRight className="h-3 w-3" /></Button>
            </div>
            <div>
              <Label className="text-xs">Couleur</Label>
              <Select value={selected.color || "dark"} onValueChange={(v) => updateBlock(selected.key, { color: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Couleur du modèle</SelectItem>
                  <SelectItem value="dark">Noir</SelectItem>
                  <SelectItem value="muted">Gris</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Label>Soulignement</Label>
              <Switch checked={!!selected.underline} onCheckedChange={(v) => updateBlock(selected.key, { underline: v })} />
            </div>
            <Button size="sm" variant="ghost" className="w-full" onClick={() => setSelectedKey(null)}>← Retour à la liste</Button>
          </div>
        )}

        {selectedKey === "qr" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">QR code</div>
              <Button size="icon" variant="ghost" onClick={() => updateQr({ hidden: !layout.qr.hidden })}>
                {layout.qr.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><Label className="text-xs">X %</Label><Input type="number" value={layout.qr.x} step={0.5} onChange={(e) => updateQr({ x: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Y %</Label><Input type="number" value={layout.qr.y} step={0.5} onChange={(e) => updateQr({ y: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Taille %</Label><Input type="number" value={layout.qr.size} step={0.5} onChange={(e) => updateQr({ size: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Label>Afficher « Scannez pour vérifier »</Label>
              <Switch checked={layout.qr.hint !== false} onCheckedChange={(v) => updateQr({ hint: v })} />
            </div>
            <Button size="sm" variant="ghost" className="w-full" onClick={() => setSelectedKey(null)}>← Retour à la liste</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CertificateLayoutEditor;
