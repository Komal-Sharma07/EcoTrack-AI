import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetCarbonTrend, getGetCarbonTrendQueryKey, useGetFootprintBreakdown, getGetFootprintBreakdownQueryKey, useListEntries, getListEntriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, Flame, Leaf, Award, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ScoreRing } from "@/components/ScoreRing";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

function getRatingLabel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 60) return { label: "Good", color: "text-teal-500" };
  if (score >= 40) return { label: "Average", color: "text-yellow-500" };
  if (score >= 20) return { label: "Poor", color: "text-orange-500" };
  return { label: "Critical", color: "text-red-500" };
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: trend, isLoading: trendLoading } = useGetCarbonTrend({ query: { queryKey: getGetCarbonTrendQueryKey({ period: "month" }) } }, { period: "month" });
  const { data: breakdown, isLoading: breakdownLoading } = useGetFootprintBreakdown({ query: { queryKey: getGetFootprintBreakdownQueryKey() } });
  const { data: entries } = useListEntries({ query: { queryKey: getListEntriesQueryKey() } });

  const rating = stats ? getRatingLabel(stats.carbonScore) : null;
  const recentEntries = entries?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your carbon footprint at a glance</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : stats ? (
          <>
            <Card className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-6 border-border">
              <ScoreRing score={stats.carbonScore} size={100} />
              <p className={`mt-2 text-sm font-semibold ${rating?.color}`}>{rating?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Carbon Score</p>
            </Card>
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</span>
                  <Leaf className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.currentMonthKgCo2.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
                {stats.percentChange !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stats.percentChange < 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {stats.percentChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {Math.abs(stats.percentChange).toFixed(1)}% vs last month
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</span>
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">days tracking</p>
                <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Badges</span>
                  <Award className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.badgesEarned}</p>
                <p className="text-xs text-muted-foreground">earned</p>
                <Link href="/badges">
                  <span className="text-xs text-primary font-medium mt-2 block hover:underline">View all</span>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="totalKgCo2" stroke="#10b981" strokeWidth={2} fill="url(#gradTotal)" name="Total CO₂ (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No trend data yet</p>
                  <Link href="/calculator"><Button variant="link" size="sm" className="mt-1 text-primary">Log your first entry</Button></Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : breakdown && breakdown.some(b => b.kgCo2 > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={breakdown} dataKey="kgCo2" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {breakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`${value.toFixed(1)} kg CO₂`, ""]}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm text-center">
                <div>
                  <p className="opacity-50">No data yet</p>
                  <Link href="/calculator"><Button variant="link" size="sm" className="text-primary">Start tracking</Button></Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent entries */}
      <Card className="border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Entries</CardTitle>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Leaf className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No entries yet.</p>
              <Link href="/calculator">
                <Button size="sm" className="mt-3 bg-primary text-primary-foreground">Calculate your footprint</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.date}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.transportMode} · {entry.dietType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{entry.totalKgCo2.toFixed(1)} kg</p>
                    <p className="text-xs text-muted-foreground">Score: {entry.score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
