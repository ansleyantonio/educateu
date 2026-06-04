/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function toFullDurationLabel(str: string): string {
  const lastChar = str[str.length - 1];

  const unitMap: Record<string, string> = {
    s: "Second",
    m: "Minute",
    h: "Hour",
    d: "Day",
    w: "Week",
    M: "Month",
    y: "Year",
  };

  const fullUnit = unitMap[lastChar];

  if (!fullUnit) return str;

  const valuePart = str.slice(0, -1);
  return `${valuePart} ${fullUnit}${valuePart !== "1" ? "s" : ""}`;
}

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhdwMy])$/);
  if (!match) throw new Error("Invalid duration format: " + duration);

  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);

  const unitMap: Record<string, number> = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    M: 1000 * 60 * 60 * 24 * 30,
    Y: 1000 * 60 * 60 * 24 * 365,
  };

  return value * unitMap[unit];
}

export function ValidateDateGap({
  data,
  ctx,
  startKey,
  endKey,
  minGap,
}: {
  data: any;
  ctx: z.RefinementCtx;
  startKey: string;
  endKey: string;
  minGap?: string;
}) {
  const startRaw = data[startKey];
  const endRaw = data[endKey];

  if (!startRaw || !endRaw) return;

  const start = new Date(startRaw);
  const end = new Date(endRaw);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    ctx.addIssue({
      path: [startKey],
      code: z.ZodIssueCode.custom,
      message: "Invalid date format.",
    });
    return;
  }

  if (start >= end) {
    ctx.addIssue({
      path: [endKey],
      code: z.ZodIssueCode.custom,
      message: `${formatKey(endKey)} must be later than ${formatKey(startKey)}.`,
    });
    return;
  }

  if (minGap) {
    const gap = end.getTime() - start.getTime();
    const minGapMs = parseDurationToMs(minGap);
    if (gap < minGapMs) {
      ctx.addIssue({
        path: [endKey],
        code: z.ZodIssueCode.custom,
        message: `The gap between ${formatKey(startKey)} and ${formatKey(endKey)} must be at least ${toFullDurationLabel(minGap)}.`,
      });
    }
  }
}
