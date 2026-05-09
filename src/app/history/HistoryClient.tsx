"use client";

import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SharePredictionButton } from "@/components/SharePredictionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deletePrediction, getPredictionHistory } from "@/services/history/historyService";
import type { HistoryItem } from "@/types/prediction";

export function HistoryClient() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const load = async (q = query) => {
    setLoading(true);
    try {
      const payload = await getPredictionHistory({ q, limit: 20 });
      setItems(payload.history);
      setHasMore(Boolean(payload.pagination?.hasMore));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("");
  }, []);

  const filteredCount = useMemo(() => items.length, [items]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await deletePrediction(id);
      toast.success("Prediction deleted.");
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Unable to delete prediction.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-sm text-muted-foreground">Search, share, and manage saved predictions.</p>
        </div>
        <form
          className="flex w-full gap-2 md:w-[420px]"
          onSubmit={(event) => {
            event.preventDefault();
            void load(query);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search material input" />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Badge variant="secondary">{filteredCount} shown</Badge>
        {hasMore ? <Badge variant="outline">More results available</Badge> : null}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : items.length ? (
          items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Band gap</Badge>
                    <Badge variant="outline">{item.output.band_gap_ev.toFixed(4)} eV</Badge>
                    {item.shared_count ? <Badge variant="outline">{item.shared_count} shared</Badge> : null}
                  </div>
                  <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{item.input_text}</p>
                  <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <SharePredictionButton predictionId={item.id} title={item.input_text.slice(0, 80)} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletingId === item.id}
                    onClick={() => void handleDelete(item.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-dashed p-10 text-center">
            <h2 className="font-semibold">No predictions found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run a prediction or adjust your search to see saved results here.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
