"use client";

import { Clock, Database, Sparkles } from "lucide-react";

import { SharePredictionButton } from "@/components/SharePredictionButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ModelName } from "@/types/prediction";

type PredictionResultCardProps = {
  predictionId?: string | null;
  materialInput: string;
  value: number;
  unit?: string;
  confidence?: number;
  model?: ModelName | string;
  timestamp?: Date | string;
  explanation?: string;
  saved?: boolean;
};

function category(value: number) {
  if (value <= 0.01) return "Metal / Semimetal";
  if (value < 2) return "Semiconductor";
  if (value < 4) return "Wide-gap semiconductor";
  return "Insulator";
}

export function PredictionResultCard({
  predictionId,
  materialInput,
  value,
  unit = "eV",
  confidence,
  model = "bandgap",
  timestamp = new Date(),
  explanation,
  saved = Boolean(predictionId),
}: PredictionResultCardProps) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  return (
    <Card className="border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5" />
              {String(model).toUpperCase()}
            </Badge>
            <Badge variant="outline">{category(value)}</Badge>
            <Badge variant={saved ? "secondary" : "outline"} className="gap-1.5">
              <Database className="size-3.5" />
              {saved ? "Saved" : "Unsaved"}
            </Badge>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="tabular-nums text-5xl font-semibold tracking-tight text-white">
                {value.toFixed(4)}
              </span>
              <span className="text-xl text-slate-400">{unit}</span>
            </div>
            {typeof confidence === "number" ? (
              <p className="mt-2 text-sm text-slate-400">
                Confidence {(confidence * 100).toFixed(0)}%
              </p>
            ) : null}
          </div>

          <p className="line-clamp-4 max-w-3xl text-sm leading-6 text-slate-300">{materialInput}</p>

          {explanation ? (
            <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
              {explanation}
            </p>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="size-3.5" />
            {date.toLocaleString()}
          </div>
        </div>

        <SharePredictionButton predictionId={predictionId} title={materialInput.slice(0, 80)} />
      </div>
    </Card>
  );
}
