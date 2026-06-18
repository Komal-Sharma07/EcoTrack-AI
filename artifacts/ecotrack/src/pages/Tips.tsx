import { useState } from "react";
import { useListTips, getListTipsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Zap, Utensils, Plane, Leaf, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["all", "transport", "energy", "food", "travel", "general"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  travel: Plane,
  general: Leaf,
};

const IMPACT_COLORS: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  high: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const CATEGORY_BG: Record<string, string> = {
  transport: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  energy: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  food: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  travel: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  general: "bg-primary/10 text-primary",
};

export default function Tips() {
  const [category, setCategory] = useState<Category>("all");

  const apiCategory = category === "all" ? undefined : category;
  const { data: tips, isLoading } = useListTips(
    apiCategory ? { category: apiCategory } : {},
    { query: { queryKey: getListTipsQueryKey(apiCategory ? { category: apiCategory } : {}) } }
  );

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sustainability Tips</h1>
        <p className="text-muted-foreground mt-1">Practical advice to reduce your carbon footprint</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter tips by category">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={category === cat ? "default" : "outline"}
            className={category === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground border-border"}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            aria-label={`Filter by ${cat === "all" ? "all categories" : cat}`}
          >
            <span className="capitalize">{cat}</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading tips">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !tips || tips.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Leaf className="h-10 w-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
          <p className="font-medium">No tips found</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" aria-label={`${tips.length} tip${tips.length !== 1 ? "s" : ""}`}>
          {tips.map(tip => {
            const Icon = CATEGORY_ICONS[tip.category] ?? Leaf;
            return (
              <li key={tip.id}>
                <Card className="border-border hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_BG[tip.category] ?? "bg-primary/10 text-primary"}`}
                        aria-hidden="true"
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight">{tip.title}</h3>
                        <span
                          className={`text-xs font-medium capitalize ${IMPACT_COLORS[tip.impact] ?? "text-muted-foreground"}`}
                          aria-label={`Impact level: ${tip.impact}`}
                        >
                          {tip.impact} impact
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
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
