"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { loadBadges, loadStreak } from "@/lib/health/wellness";
import { Award, Flame, Users } from "lucide-react";

export default function WellnessPage() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(loadStreak());
  const [badges, setBadges] = useState(loadBadges());

  useEffect(() => {
    setStreak(loadStreak());
    setBadges(loadBadges());
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("wellness.title")}</h1>
        <p className="mt-1 text-muted">{t("wellness.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-base">{t("wellness.streakTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{streak.current}</p>
            <p className="text-sm text-muted">{t("wellness.streakCurrent")}</p>
            <p className="mt-3 text-sm text-muted">
              {t("wellness.streakBest", { count: streak.best })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Award className="h-5 w-5 text-lifemed-500" />
            <CardTitle className="text-base">{t("wellness.badgesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {badges.length === 0 ? (
              <p className="text-sm text-muted">{t("wellness.noBadges")}</p>
            ) : (
              badges.map((badge) => (
                <Badge key={badge.id} variant="success">
                  {t(`wellness.badges.${badge.id}` as "wellness.badges.streak-3")}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Users className="h-5 w-5 text-lifemed-500" />
          <CardTitle className="text-base">{t("wellness.communityTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">{t("wellness.communitySoon")}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button href="/family">{t("wellness.openFamily")}</Button>
        <Button variant="secondary" href="/share">
          {t("wellness.openShare")}
        </Button>
      </div>
    </div>
  );
}
