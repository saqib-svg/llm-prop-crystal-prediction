import { useState } from 'react';
import { AlertCircle, History, Loader2, Sparkles, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';

import { predictBandGap } from '../lib/bandgapApi';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const EXAMPLES = [
  {
    name: 'TlBr₃',
    text: 'TlBrâ‚ƒ is Magnesium structured and crystallizes in the orthorhombic Pnma space group. The structure is zero-dimensional and consists of four TlBrâ‚ƒ clusters. TlÂ³âº is bonded in a trigonal planar geometry to three BrÂ¹â» atoms. All Tlâ€“Br bond lengths are 2.54 Ã…. There are two inequivalent BrÂ¹â» sites. In the first BrÂ¹â» site, BrÂ¹â» is bonded in a single-bond geometry to one TlÂ³âº atom. In the second BrÂ¹â» site, BrÂ¹â» is bonded in a single-bond geometry to one TlÂ³âº atom.',
  },
  {
    name: 'Nd₂Co₁₉Si₃',
    text: 'Ndâ‚‚Coâ‚â‚‰Siâ‚ƒ crystallizes in the monoclinic C2/m space group. Nd is bonded in a 18-coordinate geometry to nineteen Co atoms. There are a spread of Ndâ€“Co bond distances ranging from 3.04â€“3.35 Ã…. There are six inequivalent Co sites. In the first Co site, Co is bonded in a 14-coordinate geometry to two equivalent Nd, nine Co, and three Si atoms. There are a spread of Coâ€“Co bond distances ranging from 2.53â€“2.64 Ã…. All Coâ€“Si bond lengths are 2.56 Ã…. In the second Co site, Co is bonded to two equivalent Nd, eight Co, and two Si atoms to form distorted CoNdâ‚‚Coâ‚ˆSiâ‚‚ cuboctahedra that share corners with eighteen CoNdâ‚‚Coâ‚ˆSiâ‚‚ cuboctahedra, edges with four CoNdâ‚‚Coâ‚‰Si cuboctahedra, and faces with twelve CoNdâ‚‚Coâ‚ˆSiâ‚‚ cuboctahedra. There are a spread of Coâ€“Co bond distances ranging from 2.40â€“2.62 Ã…. There is one shorter (2.35 Ã…) and one longer (2.38 Ã…) Coâ€“Si bond length. In the third Co site, Co is bonded to two equivalent Nd, nine Co, and one Si atom to form a mixture of distorted corner, edge, and face-sharing CoNdâ‚‚Coâ‚‰Si cuboctahedra. There are a spread of Coâ€“Co bond distances ranging from 2.39â€“2.61 Ã…. The Coâ€“Si bond length is 2.35 Ã…. In the fourth Co site, Co is bonded to two equivalent Nd, nine Co, and one Si atom to form a mixture of distorted corner, edge, and face-sharing CoNdâ‚‚Coâ‚‰Si cuboctahedra. There are a spread of Coâ€“Co bond distances ranging from 2.36â€“2.49 Ã…. The Coâ€“Si bond length is 2.36 Ã…. In the fifth Co site, Co is bonded in a 12-coordinate geometry to two equivalent Nd, eight Co, and two Si atoms. The Coâ€“Co bond length is 2.57 Ã…. There is one shorter (2.34 Ã…) and one longer (2.38 Ã…) Coâ€“Si bond length. In the sixth Co site, Co is bonded to two equivalent Nd and ten Co atoms to form distorted CoNdâ‚‚Coâ‚â‚€ cuboctahedra that share corners with sixteen CoNdâ‚‚Coâ‚ˆSiâ‚‚ cuboctahedra, edges with four equivalent CoNdâ‚‚Coâ‚‰Si cuboctahedra, and faces with twelve CoNdâ‚‚Coâ‚ˆSiâ‚‚ cuboctahedra. There are two inequivalent Si sites. In the first Si site, Si is bonded in a 10-coordinate geometry to ten Co atoms. In the second Si site, Si is bonded in a 10-coordinate geometry to ten Co atoms.',
  },
  {
    name: 'Li₄CO₄',
    text: 'Liâ‚„COâ‚„ is Matlockite-like structured and crystallizes in the monoclinic Cm space group. There are three inequivalent LiÂ¹âº sites. In the first LiÂ¹âº site, LiÂ¹âº is bonded in a 4-coordinate geometry to four OÂ²â» atoms. There are a spread of Liâ€“O bond distances ranging from 1.91â€“2.19 Ã…. In the second LiÂ¹âº site, LiÂ¹âº is bonded to four OÂ²â» atoms to form LiOâ‚„ tetrahedra that share corners with four equivalent LiOâ‚„ tetrahedra and corners with four equivalent COâ‚„ tetrahedra. There are a spread of Liâ€“O bond distances ranging from 1.91â€“2.00 Ã…. In the third LiÂ¹âº site, LiÂ¹âº is bonded in a 4-coordinate geometry to four OÂ²â» atoms. There are three shorter (1.93 Ã…) and one longer (2.18 Ã…) Liâ€“O bond length. Câ´âº is bonded to four OÂ²â» atoms to form COâ‚„ tetrahedra that share corners with eight equivalent LiOâ‚„ tetrahedra. There are a spread of Câ€“O bond distances ranging from 1.41â€“1.44 Ã…. There are three inequivalent OÂ²â» sites. In the first OÂ²â» site, OÂ²â» is bonded in a 5-coordinate geometry to four LiÂ¹âº and one Câ´âº atom. In the second OÂ²â» site, OÂ²â» is bonded in a 5-coordinate geometry to four LiÂ¹âº and one Câ´âº atom. In the third OÂ²â» site, OÂ²â» is bonded in a 5-coordinate geometry to four LiÂ¹âº and one Câ´âº atom.',
  },
  {
    name: 'CaEu(FeO₃)₄',
    text: 'CaEu(FeOâ‚ƒ)â‚„ crystallizes in the tetragonal P4/mmm space group. Ca is bonded to twelve O atoms to form CaOâ‚â‚‚ cuboctahedra that share corners with four equivalent CaOâ‚â‚‚ cuboctahedra, corners with eight equivalent EuOâ‚â‚‚ cuboctahedra, and faces with eight equivalent FeOâ‚† octahedra. There are four shorter (2.67 Ã…) and eight longer (2.73 Ã…) Caâ€“O bond lengths. Eu is bonded to twelve O atoms to form EuOâ‚â‚‚ cuboctahedra that share corners with four equivalent EuOâ‚â‚‚ cuboctahedra, corners with eight equivalent CaOâ‚â‚‚ cuboctahedra, and faces with eight equivalent FeOâ‚† octahedra. There are eight shorter (2.64 Ã…) and four longer (2.67 Ã…) Euâ€“O bond lengths. Fe is bonded to six O atoms to form FeOâ‚† octahedra that share corners with six equivalent FeOâ‚† octahedra, faces with two equivalent CaOâ‚â‚‚ cuboctahedra, and faces with two equivalent EuOâ‚â‚‚ cuboctahedra. The corner-sharing octahedral tilt angles range from 0â€“4Â°. There are five shorter (1.89 Ã…) and one longer (1.92 Ã…) Feâ€“O bond length. There are three inequivalent O sites. In the first O site, O is bonded in a distorted linear geometry to one Ca, one Eu, and two equivalent Fe atoms. In the second O site, O is bonded in a distorted linear geometry to two equivalent Eu and two equivalent Fe atoms. In the third O site, O is bonded in a distorted square co-planar geometry to two equivalent Ca and two equivalent Fe atoms.',
  },
];

const MAX_INPUT_LENGTH = 5000;

interface HistoryEntry {
  text: string;
  prediction: number;
  unit: string;
  elapsedMs: number;
  timestamp: Date;
}

function getBandGapCategory(eV: number): { label: string; className: string } {
  if (eV <= 0.01) return { label: 'Metal / Semimetal', className: 'bg-white/10 text-white ring-1 ring-white/20' };
  if (eV < 2) return { label: 'Semiconductor', className: 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20' };
  if (eV < 4) return { label: 'Wide-Gap SC', className: 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20' };
  return { label: 'Insulator', className: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' };
}

export function BandGapPredictor() {
  const [text, setText] = useState('');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [unit, setUnit] = useState('eV');
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handlePredict = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error('Please enter a material description.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setPrediction(null);
    setElapsedMs(null);

    const t0 = performance.now();
    try {
      const response = await predictBandGap(trimmedText);
      const elapsed = performance.now() - t0;
      setPrediction(response.prediction);
      setUnit(response.unit);
      setElapsedMs(elapsed);
      setHistory(prev => [{
        text: trimmedText,
        prediction: response.prediction,
        unit: response.unit,
        elapsedMs: elapsed,
        timestamp: new Date(),
      }, ...prev].slice(0, 8));
      toast.success('Band gap predicted successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction failed.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.target.value.slice(0, MAX_INPUT_LENGTH);
    setText(nextText);
  };

  return (
    <main className="w-full px-4 py-6 md:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="h-full p-4 md:p-5 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 text-slate-200">
              <History className="size-4" />
              <h2 className="font-semibold tracking-wide">Recent predictions</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Your latest prediction history stays here for quick reuse.
            </p>

            <div className="mt-4 space-y-2">
              {history.length > 0 ? history.map((entry, i) => {
                const cat = getBandGapCategory(entry.prediction);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setText(entry.text);
                      setPrediction(entry.prediction);
                      setUnit(entry.unit);
                      setElapsedMs(entry.elapsedMs);
                      setErrorMessage(null);
                    }}
                    className="group w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-all hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.1)]"
                  >
                    <p className="line-clamp-3 text-xs leading-5 text-slate-400 group-hover:text-slate-300 transition-colors">{entry.text}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${cat.className}`}>
                        {cat.label}
                      </span>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-200">
                        {entry.prediction.toFixed(4)} <span className="text-slate-500 font-normal">{entry.unit}</span>
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      {entry.elapsedMs.toFixed(0)} ms
                    </div>
                  </button>
                );
              }) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    Recent predictions will appear here after you run the model.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </aside>

        <section className="min-w-0 space-y-6">
          <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
            <div className="p-6 md:p-10 relative z-10">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 transition-colors">
                  <Sparkles className="size-3.5" />
                  AI POWERED MATERIALS PLATFORM
                </Badge>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl leading-[1.1]">
                    Build the Future of <br/>
                    <span className="text-yellow-500">Materials Discovery</span>
                  </h1>
                  <p className="max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
                    Predict band gaps, compare materials, and accelerate scientific research with AI.
                    Paste a crystal structure or materials description below.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
                    Tokenizer loaded at startup
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
                    Used by researchers & innovators
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_420px]">
            <div className="space-y-6">
              <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white tracking-wide">Material description</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Use natural language describing the crystal, structure, or coordination environment.
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-white/10 text-slate-300">
                    <WandSparkles className="size-3.5" />
                    Regression
                  </Badge>
                </div>

                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Example: ZnO crystallizes in the hexagonal P6_3mc space group and forms corner-sharing ZnO4 tetrahedra."
                  className="field-sizing-fixed mt-4 h-[420px] overflow-y-auto font-mono text-sm bg-black/40 border-white/10 text-slate-200 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 rounded-xl p-4 placeholder:text-slate-600 transition-all"
                />

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500 font-mono">
                    {text.length} / {MAX_INPUT_LENGTH} characters
                  </div>
                  <Button 
                    onClick={handlePredict} 
                    disabled={loading} 
                    className="gap-2 sm:min-w-44 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all disabled:opacity-50 disabled:hover:bg-yellow-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-black" />
                        Predicting
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 text-black" />
                        Predict band gap
                      </>
                    )}
                  </Button>
                </div>

              {errorMessage && (
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <div>{errorMessage}</div>
                  </div>
                )}
              
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
                <h2 className="text-lg font-semibold text-white tracking-wide">Example inputs</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Load a sample description to test the API quickly.
                </p>

                <div className="mt-4 space-y-3">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.name}
                      type="button"
                      onClick={() => {
                        setText(example.text);
                        setPrediction(null);
                        setErrorMessage(null);
                        toast.info(`Loaded ${example.name}`);
                      }}
                      className="group w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.1)]"
                    >
                      <div className="text-sm font-medium text-slate-200 group-hover:text-yellow-400 transition-colors">{example.name}</div>
                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500 group-hover:text-slate-400 transition-colors">
                        {example.text}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {prediction !== null && (
            <Card className="relative overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-2xl ring-1 ring-white/5">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
            
              <div className="relative z-10 p-8 md:p-10">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Sparkles className="size-5 text-yellow-500" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300">Prediction Result</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="tabular-nums text-6xl font-light tracking-tighter text-white">
                        {prediction.toFixed(4)}
                      </span>
                      <span className="text-2xl font-medium text-slate-400">{unit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const cat = getBandGapCategory(prediction);
                        return (
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-white/20 ${cat.className}`}>
                            {cat.label}
                          </span>
                        );
                      })()}
                      {elapsedMs !== null && (
                        <span className="text-sm text-slate-400">
                          in {elapsedMs.toFixed(0)} ms
                        </span>
                      )}
                    </div>
                  </div>
            
                  <div className="w-full lg:w-1/2 lg:max-w-lg">
                    <div className="mb-2 flex justify-between text-[11px] font-bold tracking-widest text-slate-500">
                      <span>0</span>
                      <span>2</span>
                      <span>4</span>
                      <span>6</span>
                      <span>8+ eV</span>
                    </div>
                    
                    <div className="relative">
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/40 shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-400 via-yellow-500 to-rose-500 opacity-90" />
                      </div>
                      
                      <div className="absolute top-0 flex h-3 w-full justify-between px-[1px] mix-blend-overlay">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="h-full w-px bg-slate-900" />
                        ))}
                      </div>
            
                      <div 
                        className="absolute top-1/2 -ml-3 flex -translate-y-1/2 items-center justify-center transition-all duration-1000 ease-out"
                        style={{ left: `${Math.min(Math.max((prediction / 8) * 100, 0), 100)}%` }}
                      >
                        <div className="h-6 w-6 rounded-full border-4 border-slate-900 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                      </div>
                    </div>
            
                    <div className="mt-4 flex text-[10px] font-medium uppercase tracking-widest text-slate-500">
                      <div className="flex w-1/4 flex-col items-center border-l border-slate-700/50 pt-2">
                        <span>Semi</span>
                        <span className="text-[9px] text-slate-600">0 - 2</span>
                      </div>
                      <div className="flex w-1/4 flex-col items-center border-l border-slate-700/50 pt-2">
                        <span>Wide</span>
                        <span className="text-[9px] text-slate-600">2 - 4</span>
                      </div>
                      <div className="flex w-2/4 flex-col items-center border-l border-r border-slate-700/50 pt-2">
                        <span>Insulator</span>
                        <span className="text-[9px] text-slate-600">4+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
