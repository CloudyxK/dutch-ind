"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Download, CheckCircle2, XCircle, Loader2, ArrowLeft, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface CsvRow {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  categorySlug: string;
  tags: string;
  weight: string;
  variants: string; // "S:10,M:20,L:15"
  videoUrl: string;
}

interface ImportResult {
  row: number;
  name: string;
  status: "success" | "error";
  error?: string;
}

const TEMPLATE_CSV = `name,slug,description,price,comparePrice,sku,categorySlug,tags,weight,variants,videoUrl
"Dutch Hoodie Black","dutch-hoodie-black","Hoodie premium DUTCH.IND bahan fleece 320gsm",299000,,DH-BLK-001,hoodie,"hoodie,premium,oversized",400,"S:10,M:20,L:15,XL:8",
"Dutch Tee White","dutch-tee-white","Kaos DUTCH.IND 100% cotton combed 30s",149000,199000,DT-WHT-001,t-shirt,"kaos,tee,basic",200,"S:15,M:25,L:20,XL:10",`;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const row: any = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").replace(/^"|"$/g, "").trim(); });
    return row as CsvRow;
  });
}

export default function ProductImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);

  function loadFile(file: File) {
    if (!file.name.endsWith(".csv")) { toast.error("Hanya file .csv yang didukung"); return; }
    setFileName(file.name);
    setResults([]);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) { toast.error("CSV kosong atau format tidak sesuai"); return; }
      setRows(parsed);
      toast.success(`${parsed.length} produk ditemukan`);
    };
    reader.readAsText(file, "utf-8");
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  async function runImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setDone(false);
    const res: ImportResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Build variants array from "S:10,M:20,L:15"
        const variants = row.variants
          ? row.variants.split(",").map((v) => {
              const [size, stock] = v.trim().split(":");
              return { size: size.trim(), color: null, stock: parseInt(stock) || 0 };
            })
          : [{ size: "FREE SIZE", color: null, stock: 10 }];

        const payload = {
          name:         row.name,
          slug:         row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description:  row.description || row.name,
          price:        parseFloat(row.price) || 0,
          comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
          sku:          row.sku || null,
          categoryId:   "", // resolved below
          categorySlug: row.categorySlug,
          weight:       parseFloat(row.weight) || 300,
          isActive:     true,
          isFeatured:   false,
          isNewArrival: true,
          isBestSeller: false,
          tags:         row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
          images:       [],
          variants,
          videoUrl:     row.videoUrl || null,
          sizeGuide:    null,
        };

        const apiRes = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error || "Gagal");
        res.push({ row: i + 2, name: row.name, status: "success" });
      } catch (err: any) {
        res.push({ row: i + 2, name: row.name, status: "error", error: err.message });
      }
      setResults([...res]);
    }

    setImporting(false);
    setDone(true);
    const ok = res.filter((r) => r.status === "success").length;
    if (ok > 0) toast.success(`${ok} produk berhasil diimport!`);
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-produk-dutchind.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount   = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-brand-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-display tracking-widest uppercase text-white">Import Produk CSV</h1>
      </div>

      {/* Instructions */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4" /> Format CSV
        </h2>
        <p className="text-xs text-brand-gray-400">
          File CSV harus menggunakan koma sebagai pemisah (delimiter). Kolom yang tersedia:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-gray-700">
                {["Kolom", "Wajib", "Contoh"].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-brand-gray-500 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800 text-brand-gray-400">
              {[
                ["name",         "✓", "Dutch Hoodie Black"],
                ["slug",         "—", "dutch-hoodie-black (auto dari name)"],
                ["description",  "✓", "Hoodie premium bahan fleece"],
                ["price",        "✓", "299000"],
                ["comparePrice", "—", "399000"],
                ["sku",          "—", "DH-BLK-001"],
                ["categorySlug", "✓", "hoodie (harus ada di database)"],
                ["tags",         "—", "hoodie,premium,oversized"],
                ["weight",       "—", "400 (gram, default 300)"],
                ["variants",     "✓", "S:10,M:20,L:15,XL:8"],
                ["videoUrl",     "—", "https://youtu.be/..."],
              ].map(([col, req, ex]) => (
                <tr key={col}>
                  <td className="py-2 pr-4 font-mono font-bold text-white text-[11px]">{col}</td>
                  <td className="py-2 pr-4 text-center">{req === "✓" ? <span className="text-green-400">✓</span> : <span className="text-brand-gray-600">—</span>}</td>
                  <td className="py-2 text-brand-gray-500 text-[11px]">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors border border-brand-gray-700 hover:border-brand-gray-500 px-3 py-1.5">
          <Download className="w-3.5 h-3.5" /> Download Template CSV
        </button>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
          drag ? "border-white bg-white/[0.03]" : "border-brand-gray-700 hover:border-brand-gray-500"
        }`}
      >
        <Upload className="w-8 h-8 text-brand-gray-500" />
        <div className="text-center">
          <p className="text-sm text-brand-gray-300">{fileName || "Drag & drop file CSV, atau klik untuk pilih"}</p>
          <p className="text-xs text-brand-gray-600 mt-1">Hanya file .csv</p>
        </div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
      </div>

      {/* Preview table */}
      {rows.length > 0 && !done && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-gray-700 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest">{rows.length} Produk Siap Diimport</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-brand-gray-700 bg-brand-gray-800 sticky top-0">
                <tr>
                  {["#", "Nama", "Slug", "Kategori", "Harga", "Varian"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-brand-gray-400 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-800">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-gray-800/40 transition-colors">
                    <td className="px-4 py-2.5 text-brand-gray-600">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-white max-w-[180px] truncate">{row.name}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-gray-400 max-w-[120px] truncate">{row.slug || "—"}</td>
                    <td className="px-4 py-2.5 text-brand-gray-400">{row.categorySlug || "—"}</td>
                    <td className="px-4 py-2.5 font-mono">{row.price ? `Rp${parseInt(row.price).toLocaleString("id-ID")}` : "—"}</td>
                    <td className="px-4 py-2.5 text-brand-gray-500 max-w-[120px] truncate">{row.variants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-brand-gray-700">
            <button
              onClick={runImport}
              disabled={importing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</> : <><Upload className="w-4 h-4" /> Import {rows.length} Produk</>}
            </button>
          </div>
        </div>
      )}

      {/* Import progress */}
      {results.length > 0 && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs font-bold uppercase tracking-widest">Hasil Import</p>
              {done && (
                <div className="flex items-center gap-3">
                  {successCount > 0 && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {successCount} berhasil</span>}
                  {errorCount > 0 && <span className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {errorCount} gagal</span>}
                </div>
              )}
            </div>
            {done && successCount > 0 && (
              <Link href="/admin/products" className="text-xs text-brand-gray-400 hover:text-white transition-colors">
                Lihat Produk →
              </Link>
            )}
          </div>
          <div className="divide-y divide-brand-gray-800 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <div key={r.row} className="flex items-center gap-3 px-5 py-2.5">
                {r.status === "success"
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <span className="text-xs font-medium text-white flex-1 truncate">{r.name}</span>
                {r.error && <span className="text-[10px] text-red-400/80 truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
            {importing && results.length < rows.length && (
              <div className="flex items-center gap-3 px-5 py-2.5">
                <Loader2 className="w-4 h-4 text-brand-gray-500 animate-spin" />
                <span className="text-xs text-brand-gray-500">Mengimport {results.length + 1} dari {rows.length}...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
