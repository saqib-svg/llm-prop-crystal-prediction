import { notFound } from "next/navigation";

import { PredictionResultCard } from "@/components/PredictionResultCard";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";
import { SharePageActions } from "./SharePageActions";

type SharePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const [shared, currentUser] = await Promise.all([
    prisma.sharedPrediction.findUnique({
      where: { shareToken: slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        prediction: {
          select: {
            id: true,
            prompt: true,
            result: true,
            createdAt: true,
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!shared) {
    notFound();
  }

  const result = shared.prediction.result as {
    band_gap_ev?: number;
    confidence?: number;
    label?: string;
  };

  if (typeof result.band_gap_ev !== "number") {
    notFound();
  }

  const canDelete = currentUser?.id === shared.userId;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{shared.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Shared {shared.createdAt.toLocaleString()}
            {shared.user.name || shared.user.email ? ` by ${shared.user.name ?? shared.user.email}` : ""}
          </p>
        </div>
        <SharePageActions slug={slug} canDelete={canDelete} />
      </div>

      <PredictionResultCard
        predictionId={shared.prediction.id}
        materialInput={shared.prediction.prompt}
        value={result.band_gap_ev}
        unit="eV"
        confidence={result.confidence}
        timestamp={shared.prediction.createdAt}
        model="bandgap"
        saved
      />

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">Prediction metadata</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Model</dt>
            <dd className="mt-1 font-medium">bandgap</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Prediction time</dt>
            <dd className="mt-1 font-medium">{shared.prediction.createdAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Share slug</dt>
            <dd className="mt-1 font-mono text-xs">{slug}</dd>
          </div>
        </dl>
      </Card>
    </main>
  );
}
