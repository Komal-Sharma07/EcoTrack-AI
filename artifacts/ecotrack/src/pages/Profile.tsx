import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetProfile, getGetProfileQueryKey, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, CheckCircle, User, Flame, Leaf, Award } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  dietType: z.enum(["vegan", "vegetarian", "omnivore"]),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitSuccessful } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", dietType: "omnivore" },
  });

  const updateMutation = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        dietType: profile.dietType as "vegan" | "vegetarian" | "omnivore",
      });
    }
  }, [profile, reset]);

  const dietType = watch("dietType");

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({ data });
  };

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your EcoTrack AI account</p>
      </div>

      {/* Stats row */}
      {profile && (
        <div className="grid grid-cols-3 gap-4" role="list" aria-label="Profile statistics">
          <Card className="border-border" role="listitem">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Flame className="h-6 w-6 text-orange-500 mb-1" aria-hidden="true" />
              <p className="text-xl font-bold text-foreground" aria-label={`${profile.streakDays} day streak`}>{profile.streakDays}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="border-border" role="listitem">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Leaf className="h-6 w-6 text-emerald-500 mb-1" aria-hidden="true" />
              <p className="text-xl font-bold text-foreground" aria-label={`${profile.totalCarbonSaved.toFixed(0)} kg CO₂ saved`}>{profile.totalCarbonSaved.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
            </CardContent>
          </Card>
          <Card className="border-border" role="listitem">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <User className="h-6 w-6 text-primary mb-1" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground capitalize">{profile.dietType}</p>
              <p className="text-xs text-muted-foreground">Diet Type</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit form */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Edit profile form" noValidate>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
                className="mt-1.5 border-border"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                autoComplete="name"
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-destructive mt-1" role="alert">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="mt-1.5 border-border"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive mt-1" role="alert">{errors.email.message}</p>
              )}
            </div>

            <fieldset>
              <legend className="text-sm font-medium mb-2 block">Diet Type</legend>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select diet type">
                {(["vegan", "vegetarian", "omnivore"] as const).map(diet => {
                  const isSelected = dietType === diet;
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setValue("dietType", diet)}
                      aria-pressed={isSelected}
                      aria-label={`${diet} diet${isSelected ? ", currently selected" : ""}`}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      <span className="capitalize">{diet}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={updateMutation.isPending}
                aria-busy={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" /> Saving...</>
                  : "Save Changes"}
              </Button>
              {updateMutation.isSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium" role="status" aria-live="polite">
                  <CheckCircle className="h-4 w-4" aria-hidden="true" /> Saved!
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <p className="text-xs text-muted-foreground">
          Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
