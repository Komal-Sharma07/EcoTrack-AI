import { useState } from "react";
import {
  useListEntries,
  getListEntriesQueryKey,
  useDeleteEntry,
  getGetDashboardStatsQueryKey,
  getGetCarbonTrendQueryKey,
  getGetFootprintBreakdownQueryKey,
  useGetCarbonTrend,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Leaf, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "wouter";
import { CHART_CONTENT_STYLE } from "@/lib/carbon-display";

const PERIOD_OPTIONS = [
  { label: "This Week",  value: "week"  },
  { label: "This Month", value: "month" },
  { label: "This Year",  value: "year"  },
] as const;

type Period = "week" | "month" | "year";
type TrendPeriod = "week" | "month";

export default function History() {
  const queryClient = useQueryClient();
  const [period, setPeriod]           = useState<Period>("month");
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("month");

  const { data: entries, isLoading } = useListEntries(
    { period },
    { query: { queryKey: getListEntriesQueryKey({ period }) } },
  );

  const { data: trend } = useGetCarbonTrend(
    { period: trendPeriod },
    { query: { queryKey: getGetCarbonTrendQueryKey({ period: trendPeriod }) } },
  );

  const deleteMutation = useDeleteEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCarbonTrendQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFootprintBreakdownQueryKey() });
      },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">History</h1>
        <p className="text-muted-foreground mt-1">All your carbon footprint entries over time</p>
      </div>

      {/* Trend chart */}
      <Card className="border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" aria-hidden="true" /> Carbon Trend
          </CardTitle>
          <div className="flex gap-1" role="group" aria-label="Trend chart period">
            {(["week", "month"] as const).map(p => (
              <Button
                key={p}
                size="sm"
                variant={trendPeriod === p ? "default" : "ghost"}
                className={trendPeriod === p ? "bg-primary text-primary-foreground h-7 text-xs" : "h-7 text-xs"}
                onClick={() => setTrendPeriod(p)}
                aria-pressed={trendPeriod === p}
                aria-label={`Show ${p === "week" ? "weekly" : "monthly"} trend`}
              >
                {p === "week" ? "Weekly" : "Monthly"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {trend && trend.length > 0 ? (
            <figure aria-label={`Carbon trend chart — ${trendPeriod === "week" ? "weekly" : "monthly"} view`}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_CONTENT_STYLE} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="transportKgCo2"   name="Transport"   fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="a" />
                  <Bar dataKey="electricityKgCo2" name="Electricity" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="foodKgCo2"        name="Food"        fill="#10b981" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="travelKgCo2"      name="Travel"      fill="#8b5cf6" radius={[3, 3, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </figure>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </CardContent>
      </Card>

      {/* Entry list */}
      <Card className="border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold" id="log-entries-heading">Log Entries</CardTitle>
          <div className="flex gap-1" role="group" aria-label="Filter entries by period">
            {PERIOD_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                size="sm"
                variant={period === opt.value ? "default" : "ghost"}
                className={period === opt.value ? "bg-primary text-primary-foreground h-7 text-xs" : "h-7 text-xs text-muted-foreground"}
                onClick={() => setPeriod(opt.value)}
                aria-pressed={period === opt.value}
                aria-label={`Show entries for ${opt.label.toLowerCase()}`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading entries">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Leaf className="h-10 w-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
              <p className="font-medium">No entries for this period</p>
              <p className="text-sm mt-1 opacity-70">Try a different time range or log a new entry</p>
              <Link href="/calculator">
                <Button size="sm" className="mt-4 bg-primary text-primary-foreground">Calculate footprint</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2" aria-labelledby="log-entries-heading">
              {entries.map(entry => (
                <li key={entry.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.date}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.transportMode} · {entry.dietType} diet</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{entry.totalKgCo2.toFixed(1)} kg</p>
                      <p className="text-xs text-muted-foreground">Score: {entry.score}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: entry.id })}
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete entry from ${entry.date}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
