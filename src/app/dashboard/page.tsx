import { redirect } from "next/navigation";
import { Activity, BarChart3, Clock, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [predictionCount, sharedPredictionCount, recentPredictions] = await Promise.all([
    prisma.predictionHistory.count({ where: { userId: user.id } }),
    prisma.sharedPrediction.count({ where: { userId: user.id } }),
    prisma.predictionHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        prompt: true,
        result: true,
        createdAt: true,
      },
    }),
  ]);

  const modelUsage = recentPredictions.reduce<Record<string, number>>((acc, prediction) => {
    const result = prediction.result as { label?: string };
    const key = result.label ? "bandgap" : "bandgap";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Prediction activity, sharing, and model usage at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Predictions</span>
            <BarChart3 className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-3xl font-semibold">{predictionCount}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Shared</span>
            <Share2 className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-3xl font-semibold">{sharedPredictionCount}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Recent activity</span>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-3xl font-semibold">{recentPredictions.length}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-4" />
            <h2 className="font-semibold">Recent predictions</h2>
          </div>
          {recentPredictions.length ? (
            <div className="space-y-3">
              {recentPredictions.map((prediction) => {
                const result = prediction.result as { band_gap_ev?: number };
                return (
                  <div key={prediction.id} className="rounded-lg border border-border/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{prediction.prompt}</p>
                      <Badge variant="secondary">{typeof result.band_gap_ev === "number" ? `${result.band_gap_ev.toFixed(4)} eV` : "Queued"}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{prediction.createdAt.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
              Run a prediction to populate your dashboard.
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Model usage</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(modelUsage).length ? (
              Object.entries(modelUsage).map(([model, count]) => (
                <div key={model} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <span className="text-sm capitalize">{model}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No model usage yet.</p>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
