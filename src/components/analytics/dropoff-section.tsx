"use client";

import { DropOffChart } from "./dropoff-chart";
import type { DropOffSummary } from "@/actions/dropoff";

interface DropOffSectionProps {
  data: DropOffSummary | null;
}

export function DropOffSection({ data }: DropOffSectionProps) {
  if (!data) return null;
  return <DropOffChart data={data} />;
}
