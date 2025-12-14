"use client";

import { FeatureCard } from "@/components/feature-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/lib/translations";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <Header />
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
            <FeatureCard
              title={t.cityStats}
              imagePath="/stats-card-icon.svg"
              description={t.cityStatsDesc}
              href="/data-view"
            />

            <FeatureCard
              title={t.stationsView}
              imagePath="/map-card-icon.svg"
              description={t.stationsViewDesc}
              href="/map-view"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
