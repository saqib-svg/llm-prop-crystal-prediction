"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, History, Loader2, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { PredictionResultCard } from "@/components/PredictionResultCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getPredictionHistory } from "@/services/history/historyService";
import { predictBandGap } from "@/services/prediction/predictionService";
import type { HistoryItem } from "@/types/prediction";

const EXAMPLES = [
  {
    name: "TlBr₃",
    text: "TlBr₃ is magnesium structured and crystallizes in the orthorhombic Pnma space group. The structure consists of TlBr₃ clusters with Tl³⁺ bonded to three Br¹⁻ atoms.",
  },
  {
    name: "Nd₂Co₁₉Si₃",
    text: "Nd₂Co₁₉Si₃ crystallizes in the monoclinic C2/m space group. Nd is bonded in a high-coordinate geometry to Co atoms, with Co-Si coordination environments throughout the lattice.",
  },
  {
    name: "Li₄CO₄",
    text: "Li₄CO₄ is matlockite-like and crystallizes in the monoclinic Cm space group. Li atoms form LiO₄ tetrahedra connected to CO₄ tetrahedra.",
  },
  {
    name: "CaEu(FeO₃)₄",
    text: "CaEu(FeO₃)₄ crystallizes in the tetragonal P4/mmm space group. Ca and Eu form cuboctahedral oxygen coordination environments around FeO₆ octahedra.",
  },
];

const MAX_INPUT_LENGTH = 5000;
const GUEST_LIMIT = 2;

type ActivePrediction = {
  id?: string | null;
  value: number;
  unit: string;
  confidence?: number;
  materialInput: string;
  timestamp: Date;
  properties?: Record<string, { value: number | string; unit?: string; confidence?: number }>;
};

function getValue(row: HistoryItem) {
  const legacyVal = row.output.band_gap_ev;
  if (typeof legacyVal === "number") return legacyVal;
  
  const propVal = row.output.properties?.band_gap?.value;
  if (propVal !== undefined) return Number(propVal);
  
  return 0;
}

export function BandGapPredictor() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [activePrediction, setActivePrediction] = useState<ActivePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [predictionCount, setPredictionCount] = useState(0);

  const userEmail = session?.user?.email;
  const isGuest = !userEmail && status !== "loading";
  const isGuestLimitReached = isGuest && predictionCount >= GUEST_LIMIT;

  const loadHistory = async () => {
    if (!userEmail || status === "loading") {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const payload = await getPredictionHistory({ limit: 5 });
      setHistory(Array.isArray(payload.history) ? payload.history : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load prediction history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [userEmail, status]);

  useEffect(() => {
    const storedCount = window.localStorage.getItem("prediction_count");
    const parsedCount = Number(storedCount);
    setPredictionCount(Number.isFinite(parsedCount) ? Math.max(0, parsedCount) : 0);
  }, []);

  const updatePredictionCount = (nextCount: number) => {
    window.localStorage.setItem("prediction_count", String(nextCount));
    setPredictionCount(nextCount);
  };

  const handlePredict = async () => {
    const materialInput = text.trim();
    if (!materialInput) {
      toast.error("Please enter a material description.");
      return;
    }

    if (isGuestLimitReached) {
      setErrorMessage("Login to continue with unlimited predictions.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setActivePrediction(null);

    try {
      const response = await predictBandGap(materialInput);
      setActivePrediction({
        id: response.id,
        value: response.prediction,
        unit: response.unit,
        confidence: response.confidence,
        materialInput,
        timestamp: new Date(),
        properties: response.properties,
      });

      if (isGuest) {
        updatePredictionCount(Math.min(GUEST_LIMIT, predictionCount + 1));
      } else {
        await loadHistory();
      }

      toast.success("Prediction complete.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Prediction failed.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full px-4 py-6 md:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-200">
                <History className="size-4" />
                <h2 className="font-semibold tracking-wide">Recent predictions</h2>
              </div>
              {userEmail ? (
                <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
                  View all
                </Button>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              {historyLoading ? (
                <>
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </>
              ) : history.length > 0 ? (
                history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      setText(entry.input_text);
                      setActivePrediction({
                        id: entry.id,
                        value: getValue(entry),
                        unit: "eV",
                        confidence: entry.output.confidence,
                        materialInput: entry.input_text,
                        timestamp: new Date(entry.created_at),
                        properties: entry.output.properties,
                      });
                      setErrorMessage(null);
                    }}
                    className="group w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:border-yellow-500/50 hover:bg-white/10"
                  >
                    <p className="line-clamp-3 text-xs leading-5 text-slate-400">{entry.input_text}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleDateString()}</span>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-200">
                        {getValue(entry).toFixed(4)} eV
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    {userEmail ? "Saved predictions will appear here." : "Login to save prediction history."}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </aside>

        <section className="min-w-0 space-y-6">
          <Card className="border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit gap-1.5 bg-yellow-500/10 text-yellow-500">
                  <Sparkles className="size-3.5" />
                  AI Materials Platform
                </Badge>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                    Materials property prediction
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                    Predict band gap from natural-language crystal and coordination descriptions.
                  </p>
                </div>
              </div>
              {!userEmail && status !== "loading" ? (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-100">
                  {Math.max(0, GUEST_LIMIT - predictionCount)} guest predictions remaining
                </div>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Material input</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Include composition, space group, local coordination, and useful structural context.
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <WandSparkles className="size-3.5" />
                  Band gap
                </Badge>
              </div>

              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, MAX_INPUT_LENGTH))}
                placeholder="Example: ZnO crystallizes in the hexagonal P6_3mc space group and forms corner-sharing ZnO4 tetrahedra."
                className="mt-4 h-[340px] overflow-y-auto rounded-lg border-white/10 bg-black/40 p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus-visible:border-yellow-500/50 focus-visible:ring-yellow-500/50"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">{text.length} / {MAX_INPUT_LENGTH} characters</div>
                <Button
                  onClick={handlePredict}
                  disabled={loading || isGuestLimitReached}
                  className="gap-2 bg-yellow-500 font-semibold text-black hover:bg-yellow-400 sm:min-w-40"
                >
                  {loading ? <Loader2 className="size-4 animate-spin text-black" /> : <Sparkles className="size-4 text-black" />}
                  {loading ? "Predicting" : "Predict"}
                </Button>
              </div>

              {isGuestLimitReached ? (
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-slate-950/80 p-4 text-sm text-slate-200">
                  <div className="font-semibold text-white">Free limit reached</div>
                  <p className="mt-1 text-slate-400">Login to continue with unlimited predictions and saved history.</p>
                  <Button className="mt-3 bg-yellow-500 text-black hover:bg-yellow-400" onClick={() => router.push("/login")}>
                    Continue
                  </Button>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              ) : null}
            </Card>

            <Card className="border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Examples</h2>
              <div className="mt-4 space-y-3">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.name}
                    type="button"
                    onClick={() => {
                      setText(example.text);
                      setActivePrediction(null);
                      setErrorMessage(null);
                      toast.info(`Loaded ${example.name}`);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:border-yellow-500/50 hover:bg-white/10"
                  >
                    <div className="text-sm font-medium text-slate-200">{example.name}</div>
                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">{example.text}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {activePrediction ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(
                activePrediction.properties ?? {
                  band_gap: {
                    value: activePrediction.value,
                    unit: activePrediction.unit,
                    confidence: activePrediction.confidence,
                  },
                }
              ).map(([propertyKey, propData]) => (
                <PredictionResultCard
                  key={propertyKey}
                  predictionId={activePrediction.id}
                  materialInput={activePrediction.materialInput}
                  value={Number(propData.value)}
                  unit={propData.unit ?? "eV"}
                  confidence={propData.confidence}
                  model="bandgap"
                  propertyKey={propertyKey}
                  timestamp={activePrediction.timestamp}
                  saved={Boolean(activePrediction.id)}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
