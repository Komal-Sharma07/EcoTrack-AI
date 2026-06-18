import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCalculateFootprint, useCreateEntry, getListEntriesQueryKey, getGetDashboardStatsQueryKey, getGetCarbonTrendQueryKey, getGetFootprintBreakdownQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScoreRing } from "@/components/ScoreRing";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, CheckCircle, Car, Bike, Bus, Train, Footprints, Zap, Utensils, Plane } from "lucide-react";

const formSchema = z.object({
  transportKm: z.number().min(0).max(500),
  transportMode: z.enum(["car", "bike", "bus", "train", "walking"]),
  electricityKwh: z.number().min(0).max(5000),
  dietType: z.enum(["vegan", "vegetarian", "omnivore"]),
  flightsPerYear: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

const TRANSPORT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  car: Car,
  bike: Bike,
  bus: Bus,
  train: Train,
  walking: Footprints,
};

const BREAKDOWN_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

function getRatingLabel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 60) return { label: "Good", color: "text-teal-500", bg: "bg-teal-500/10" };
  if (score >= 40) return { label: "Average", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (score >= 20) return { label: "Poor", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" };
}

export default function Calculator() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{
    totalKgCo2: number; transportKgCo2: number; electricityKgCo2: number;
    foodKgCo2: number; travelKgCo2: number; score: number; rating: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transportKm: 20,
      transportMode: "car",
      electricityKwh: 300,
      dietType: "omnivore",
      flightsPerYear: 2,
    },
  });

  const calculateMutation = useCalculateFootprint({
    mutation: {
      onSuccess: (data) => { setResult(data); setSaved(false); },
    },
  });

  const createEntryMutation = useCreateEntry({
    mutation: {
      onSuccess: () => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCarbonTrendQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFootprintBreakdownQueryKey() });
      },
    },
  });

  const values = watch();

  const onSubmit = (data: FormData) => {
    calculateMutation.mutate({ data });
  };

  const handleSave = () => {
    if (!result) return;
    createEntryMutation.mutate({
      data: {
        transportKm: values.transportKm,
        transportMode: values.transportMode,
        electricityKwh: values.electricityKwh,
        dietType: values.dietType,
        flightsPerYear: values.flightsPerYear,
      },
    });
  };

  const breakdownData = result ? [
    { name: "Transport", value: result.transportKgCo2 },
    { name: "Electricity", value: result.electricityKgCo2 },
    { name: "Food", value: result.foodKgCo2 },
    { name: "Air Travel", value: result.travelKgCo2 },
  ] : [];

  const rating = result ? getRatingLabel(result.score) : null;
  const TransportIcon = TRANSPORT_ICONS[values.transportMode] ?? Car;

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Carbon Calculator</h1>
        <p className="text-muted-foreground mt-1">Estimate your annual carbon footprint</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Car className="h-4 w-4" /> Transportation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Daily distance: <span className="text-primary font-bold">{values.transportKm} km</span></Label>
                <Slider
                  min={0} max={200} step={1}
                  value={[values.transportKm]}
                  onValueChange={([v]) => setValue("transportKm", v)}
                  className="mt-3"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Mode of transport</Label>
                <div className="grid grid-cols-5 gap-2">
                  {(["car", "bus", "train", "bike", "walking"] as const).map(mode => {
                    const Icon = TRANSPORT_ICONS[mode];
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setValue("transportMode", mode)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${values.transportMode === mode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="capitalize text-[10px]">{mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" /> Electricity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-sm font-medium">Monthly usage: <span className="text-primary font-bold">{values.electricityKwh} kWh</span></Label>
              <Slider
                min={0} max={2000} step={10}
                value={[values.electricityKwh]}
                onValueChange={([v]) => setValue("electricityKwh", v)}
                className="mt-3"
              />
              <p className="text-xs text-muted-foreground mt-2">Avg. US household: ~900 kWh/month</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Utensils className="h-4 w-4" /> Diet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {(["vegan", "vegetarian", "omnivore"] as const).map(diet => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setValue("dietType", diet)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${values.dietType === diet ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    <span className="capitalize">{diet}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Plane className="h-4 w-4" /> Air Travel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-sm font-medium">Flights per year: <span className="text-primary font-bold">{values.flightsPerYear}</span></Label>
              <Slider
                min={0} max={50} step={1}
                value={[values.flightsPerYear]}
                onValueChange={([v]) => setValue("flightsPerYear", v)}
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" disabled={calculateMutation.isPending}>
            {calculateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</> : "Calculate My Footprint"}
          </Button>
        </form>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <ScoreRing score={result.score} size={120} strokeWidth={10} />
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${rating?.bg} ${rating?.color} mb-2`}>
                    {rating?.label}
                  </div>
                  <p className="text-3xl font-bold text-foreground">{result.totalKgCo2.toFixed(0)} <span className="text-lg font-normal text-muted-foreground">kg CO₂/yr</span></p>
                  <p className="text-sm text-muted-foreground mt-1">Global avg: ~4,000 kg/yr</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">By Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                        {breakdownData.map((_, i) => <Cell key={i} fill={BREAKDOWN_COLORS[i]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, ""]}
                      />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {[
                      { label: "Transport", value: result.transportKgCo2, color: BREAKDOWN_COLORS[0] },
                      { label: "Electricity", value: result.electricityKgCo2, color: BREAKDOWN_COLORS[1] },
                      { label: "Food", value: result.foodKgCo2, color: BREAKDOWN_COLORS[2] },
                      { label: "Air Travel", value: result.travelKgCo2, color: BREAKDOWN_COLORS[3] },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-medium text-foreground">{item.value.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {saved ? (
                <div className="flex items-center gap-2 justify-center py-3 text-emerald-500 font-medium text-sm">
                  <CheckCircle className="h-4 w-4" /> Entry saved to your history!
                </div>
              ) : (
                <Button onClick={handleSave} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" disabled={createEntryMutation.isPending}>
                  {createEntryMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save This Entry"}
                </Button>
              )}
            </>
          ) : (
            <Card className="border-border border-dashed h-full min-h-64 flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Plane className="h-8 w-8 text-primary opacity-50" />
                </div>
                <p className="font-medium">Fill in the form and click Calculate</p>
                <p className="text-sm mt-1 opacity-70">Your carbon score will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
