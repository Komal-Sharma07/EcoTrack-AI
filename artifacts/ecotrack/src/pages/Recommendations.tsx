import { useListRecommendations, getListRecommendationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, Zap, Car, Utensils, Plane, Leaf, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  travel: Plane,
  general: Leaf,
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  energy: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  food: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  travel: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  general: "bg-primary/10 text-primary",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

const CATEGORIES = ["all", "transport", "energy", "food", "travel", "general"] as const;
type Category = typeof CATEGORIES[number];

export default function Recommendations() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { data: recs, isLoading } = useListRecommendations({ query: { queryKey: getListRecommendationsQueryKey() } });

  const filtered = recs?.filter(r => activeCategory === "all" || r.category === activeCategory) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Recommendations</h1>
        <p className="text-muted-foreground mt-1">Personalized actions to reduce your emissions</p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter recommendations by category">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            className={activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground border-border"}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            aria-label={`Filter by ${cat === "all" ? "all categories" : cat}`}
          >
            <span className="capitalize">{cat}</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading recommendations">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Leaf className="h-10 w-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
          <p className="font-medium">No recommendations found</p>
          <p className="text-sm opacity-70 mt-1">Try a different category</p>
        </div>
      ) : (
        <ul className="grid gap-4" aria-label={`${filtered.length} recommendation${filtered.length !== 1 ? "s" : ""}`}>
          {filtered.map(rec => {
            const Icon = CATEGORY_ICONS[rec.category] ?? Leaf;
            return (
              <li key={rec.id}>
                <Card className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[rec.category] ?? "bg-primary/10 text-primary"}`}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground leading-tight">{rec.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[rec.difficulty]}`}
                              aria-label={`Difficulty: ${rec.difficulty}`}
                            >
                              {rec.difficulty}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                        <div className="flex items-center gap-1.5 mt-3 text-emerald-500 font-semibold text-sm" aria-label={`Potential saving: up to ${rec.potentialSavingKg.toFixed(0)} kg CO₂ per year`}>
                          <TrendingDown className="h-4 w-4" aria-hidden="true" />
                          Save up to {rec.potentialSavingKg.toFixed(0)} kg CO₂/yr
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
