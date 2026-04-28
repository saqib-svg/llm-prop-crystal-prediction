import { useRef, useState } from 'react';
import {
    Download,
    FileText,
    Loader2,
    Sparkles,
    UploadCloud,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ResultRow {
    index: number;
    text: string;
    prediction: number | null;
    error: string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function parseCsv(raw: string): string[] {
    // Accept one description per line; skip blank lines and header rows
    return raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
}

function getBandGapCategory(eV: number): { label: string; className: string } {
    if (eV <= 0.01) return { label: 'Metal', className: 'bg-slate-500 text-white' };
    if (eV < 2) return { label: 'Semiconductor', className: 'bg-emerald-500 text-white' };
    if (eV < 4) return { label: 'Wide-Gap SC', className: 'bg-amber-500 text-white' };
    return { label: 'Insulator', className: 'bg-rose-500 text-white' };
}

function exportCsv(rows: ResultRow[]): void {
    const header = 'index,description,band_gap_eV,error';
    const lines = rows.map(
        (r) =>
            `${r.index},"${r.text.replace(/"/g, '""')}",${r.prediction ?? ''},${r.error ?? ''}`,
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bandgap_predictions.csv';
    a.click();
    URL.revokeObjectURL(url);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

const BATCH_SIZE = 10; // texts per /batch-predict request

export function BatchPredictor() {
    const [texts, setTexts] = useState<string[]>([]);
    const [filename, setFilename] = useState<string | null>(null);
    const [results, setResults] = useState<ResultRow[]>([]);
    const [progress, setProgress] = useState(0); // 0-100
    const [running, setRunning] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    /* ── File ingestion ── */
    const handleFile = (file: File) => {
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            toast.error('Please upload a .csv or .txt file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const parsed = parseCsv(e.target?.result as string);
            if (parsed.length === 0) {
                toast.error('No valid rows found in the file.');
                return;
            }
            setTexts(parsed);
            setFilename(file.name);
            setResults([]);
            setProgress(0);
            toast.success(`Loaded ${parsed.length} description${parsed.length === 1 ? '' : 's'}.`);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    /* ── Batch inference ── */
    const runBatch = async () => {
        if (texts.length === 0) return;
        setRunning(true);
        setResults([]);
        setProgress(0);

        const allResults: ResultRow[] = [];
        const chunks: string[][] = [];
        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            chunks.push(texts.slice(i, i + BATCH_SIZE));
        }

        for (let ci = 0; ci < chunks.length; ci++) {
            const chunk = chunks[ci];
            const offset = ci * BATCH_SIZE;

            try {
                const res = await fetch('/batch-predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts: chunk }),
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json() as {
                    results: { index: number; prediction?: number; error?: string }[];
                };

                for (const item of data.results) {
                    allResults.push({
                        index: offset + item.index,
                        text: chunk[item.index],
                        prediction: item.prediction ?? null,
                        error: item.error ?? null,
                    });
                }
            } catch (err) {
                // Mark whole chunk as errors
                for (let j = 0; j < chunk.length; j++) {
                    allResults.push({ index: offset + j, text: chunk[j], prediction: null, error: String(err) });
                }
            }

            setProgress(Math.round(((ci + 1) / chunks.length) * 100));
            setResults([...allResults]);
        }

        toast.success(`Done! ${allResults.filter((r) => r.prediction !== null).length}/${texts.length} succeeded.`);
        setRunning(false);
    };

    const reset = () => {
        setTexts([]);
        setFilename(null);
        setResults([]);
        setProgress(0);
        if (fileRef.current) fileRef.current.value = '';
    };

    const succeeded = results.filter((r) => r.prediction !== null).length;
    const failed = results.filter((r) => r.error !== null).length;

    /* ── Render ── */
    return (
        <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Batch Inference</h1>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV / TXT file (one material description per line). The backend runs all
                    predictions via <code className="text-xs bg-muted px-1 py-0.5 rounded">/batch-predict</code> and results are downloadable.
                </p>
            </div>

            {/* Upload zone */}
            <Card
                className="p-0 overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div
                    className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border/60 rounded-xl p-10 cursor-pointer hover:bg-accent/40 transition-colors"
                    onClick={() => fileRef.current?.click()}
                >
                    <UploadCloud className="size-10 text-muted-foreground" />
                    <div className="text-center">
                        <p className="font-medium text-sm">Drop a CSV / TXT file here, or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">One material description per line · max 100 per batch chunk</p>
                    </div>
                    {filename && (
                        <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium">
                            <FileText className="size-3.5" />
                            {filename}
                            <button
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    )}
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={handleInputChange}
                />
            </Card>

            {/* Controls */}
            {texts.length > 0 && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{texts.length}</span>{' '}
                        description{texts.length === 1 ? '' : 's'} loaded
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={reset} disabled={running}>
                            Clear
                        </Button>
                        <Button onClick={runBatch} disabled={running} className="gap-2 min-w-36">
                            {running ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Running… {progress}%
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Run Batch Predict
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Progress bar */}
            {running && (
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold">Results</h3>
                            <Badge variant="secondary">{succeeded} succeeded</Badge>
                            {failed > 0 && <Badge variant="destructive">{failed} failed</Badge>}
                        </div>
                        {!running && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportCsv(results)}>
                                <Download className="size-3.5" />
                                Download CSV
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border/60">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 text-left w-10">#</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-right w-36">Band Gap</th>
                                    <th className="px-4 py-2 text-left w-36">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {results.map((row) => {
                                    const cat = row.prediction !== null ? getBandGapCategory(row.prediction) : null;
                                    return (
                                        <tr key={row.index} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-2 font-mono text-muted-foreground">{row.index + 1}</td>
                                            <td className="px-4 py-2 max-w-xs truncate text-xs text-muted-foreground">{row.text}</td>
                                            <td className="px-4 py-2 text-right tabular-nums font-medium">
                                                {row.prediction !== null
                                                    ? `${row.prediction.toFixed(4)} eV`
                                                    : <span className="text-destructive text-xs">{row.error ?? 'Error'}</span>
                                                }
                                            </td>
                                            <td className="px-4 py-2">
                                                {cat ? (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.className}`}>
                                                        {cat.label}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </main>
    );
}
