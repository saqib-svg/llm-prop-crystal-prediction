import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Info, BarChart3, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { predictBandGap } from '../lib/bandgapApi';

interface PredictionResult {
  bandGap: number;
  processingTime: number;
}

interface PredictionHistory {
  input: string;
  result: PredictionResult;
  timestamp: Date;
}

const EXAMPLE_STRUCTURES = [
  {
    name: "Silicon (Si)",
    description: "Si is Cubic I a=3 b=3 c=3 α=90 β=90 γ=90. Si is crystallized in a diamond structure. The Si-Si bond lengths are 2.35 Å.",
    actualBandGap: 1.12
  },
  {
    name: "Gallium Arsenide (GaAs)",
    description: "GaAs is Sphalerite Zincblende structured and crystallizes in the cubic F-43m space group. The structure is three-dimensional. Ga is bonded to four equivalent As atoms to form corner-sharing GaAs4 tetrahedra. All Ga-As bond lengths are 2.45 Å.",
    actualBandGap: 1.42
  },
  {
    name: "Germanium (Ge)",
    description: "Ge is Diamond I a=3 b=3 c=3 α=90 β=90 γ=90. Ge crystallizes in the diamond cubic structure. Each Ge atom is tetrahedrally coordinated with four other Ge atoms. The Ge-Ge bond length is 2.45 Å.",
    actualBandGap: 0.66
  },
  {
    name: "Aluminum Nitride (AlN)",
    description: "AlN is Wurtzite structured and crystallizes in the hexagonal P6_3mc space group. The structure is three-dimensional. Al is bonded to four N atoms to form corner-sharing AlN4 tetrahedra. There are three shorter (1.89 Å) and one longer (1.91 Å) Al-N bond length.",
    actualBandGap: 6.28
  },
  {
    name: "Zinc Oxide (ZnO)",
    description: "ZnO crystallizes in the hexagonal P6_3mc space group. The structure is three-dimensional. Zn is bonded to four equivalent O atoms to form corner-sharing ZnO4 tetrahedra. All Zn-O bond lengths are 1.98 Å. O is bonded to four equivalent Zn atoms to form a mixture of edge and corner-sharing OZn4 tetrahedra.",
    actualBandGap: 3.37
  }
];

function getBandGapCategory(eV: number): { label: string; color: string } {
  if (eV <= 0.01) return { label: 'Metal / Semimetal', color: 'bg-slate-500' };
  if (eV < 2) return { label: 'Semiconductor', color: 'bg-emerald-500' };
  if (eV < 4) return { label: 'Wide-Gap Semiconductor', color: 'bg-amber-500' };
  return { label: 'Insulator', color: 'bg-rose-500' };
}

export function PredictionInterface() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);

  const handlePredict = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a crystal structure description');
      return;
    }

    setIsLoading(true);
    setResult(null);

    const t0 = performance.now();
    try {
      const response = await predictBandGap(inputText.trim());
      const elapsed = performance.now() - t0;
      const prediction: PredictionResult = {
        bandGap: response.prediction,
        processingTime: elapsed,
      };
      setResult(prediction);
      toast.success('Prediction completed!');
      setHistory(prev => [{ input: inputText, result: prediction, timestamp: new Date() }, ...prev].slice(0, 10));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (example: typeof EXAMPLE_STRUCTURES[0]) => {
    setInputText(example.description);
    setResult(null);
    toast.info(`Loaded example: ${example.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-lg">Crystal Structure Description</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a natural language description of a crystalline material structure
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Info className="size-3" />
              DistilRoBERTa Model
            </Badge>
          </div>

          <Textarea
            placeholder="e.g., Si is Cubic I a=3 b=3 c=3 α=90 β=90 γ=90. Si is crystallized in a diamond structure. The Si-Si bond lengths are 2.35 Å..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {inputText.length} characters
            </div>
            <Button
              onClick={handlePredict}
              disabled={isLoading || !inputText.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Predict Band Gap
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Example Structures */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Example Crystal Structures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLE_STRUCTURES.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="p-4 border rounded-lg text-left hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm mb-1">{example.name}</div>
              <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {example.description}
              </div>
              <Badge variant="outline" className="text-xs">
                Actual: {example.actualBandGap} eV
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h3 className="font-semibold text-lg">Prediction Results</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Predicted Band Gap</div>
                <div className="text-3xl font-bold text-primary">
                  {result.bandGap.toFixed(4)} <span className="text-lg font-normal">eV</span>
                </div>
                <div className="mt-2">
                  {(() => {
                    const cat = getBandGapCategory(result.bandGap);
                    return (
                      <span className={`inline-block text-white text-xs font-medium px-2.5 py-1 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Clock className="size-3.5" />
                  Processing Time
                </div>
                <div className="text-3xl font-bold">
                  {result.processingTime.toFixed(0)}<span className="text-lg font-normal">ms</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">End-to-end API latency</div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="text-sm font-medium mb-2">Interpretation Guide</div>
              <div className="text-xs text-muted-foreground space-y-1">
                {result.bandGap <= 0.01 && <p>• Zero band gap indicates a metallic or semimetallic material</p>}
                {result.bandGap > 0.01 && result.bandGap < 2 && <p>• Small band gap ({result.bandGap.toFixed(4)} eV) suggests semiconductor properties, useful for electronics and photovoltaics</p>}
                {result.bandGap >= 2 && result.bandGap < 4 && <p>• Medium band gap ({result.bandGap.toFixed(4)} eV) indicates wide-bandgap semiconductor behavior, suitable for power electronics</p>}
                {result.bandGap >= 4 && <p>• Large band gap ({result.bandGap.toFixed(4)} eV) suggests insulating properties with potential optical applications</p>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <h3 className="font-semibold text-lg">Prediction History</h3>
            </div>

            <div className="space-y-2">
              {history.map((entry, index) => {
                const cat = getBandGapCategory(entry.result.bandGap);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{entry.input}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{entry.timestamp.toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-white text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                      <div className="text-sm font-semibold tabular-nums">
                        {entry.result.bandGap.toFixed(4)} <span className="font-normal text-muted-foreground">eV</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}