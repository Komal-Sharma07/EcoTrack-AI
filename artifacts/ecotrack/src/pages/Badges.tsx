import { useListBadges, getListBadgesQueryKey, useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Lock, Flame, Star } from "lucide-react";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Badges() {
  const { data: badges, isLoading } = useListBadges({ query: { queryKey: getListBadgesQueryKey() } });
  const { data: stats } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  const earned = badges?.filter(b => b.earned) ?? [];
  const locked = badges?.filter(b => !b.earned) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Achievements</h1>
        <p className="text-muted-foreground mt-1">Your green badges and streaks</p>
      </div>

      {/* Streak + summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-border col-span-1">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.streakDays ?? 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="border-border col-span-1">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{earned.length}</p>
            <p className="text-xs text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
        <Card className="border-border col-span-2 sm:col-span-1">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{badges?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Badges</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <>
          {earned.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" /> Earned
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {earned.map(badge => (
                  <Card key={badge.id} className="border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">{formatDate(badge.earnedAt)}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Locked
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {locked.map(badge => (
                  <Card key={badge.id} className="border-border opacity-50 grayscale">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2 filter grayscale">{badge.icon}</div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{badge.description}</p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Locked
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {badges?.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No badges yet</p>
              <p className="text-sm opacity-70 mt-1">Start tracking to earn your first badge</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
