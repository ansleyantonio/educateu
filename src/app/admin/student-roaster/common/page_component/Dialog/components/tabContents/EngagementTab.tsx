"use client";

import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Info,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewingMetric = {
  trackedContent: number;
  completedContent: number;
  completionRate: number | null;
  submittedAssessments: number;
  averageAssessmentScore: number | null;
};

type ViewingAnalysis = {
  status: "current" | "no_data" | "unavailable";
  reason?: string | null;
  metrics?: ViewingMetric | null;
  trend?: Array<{ week: string; activity: number }>;
  lastActivityAt?: string | null;
  lastLoginAt?: string | null;
  source?: string;
  generatedAt?: string;
};

type EngagementProps = {
  mode?: string;
  data?: {
    viewingAnalysis?: ViewingAnalysis | null;
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MetricCard = ({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) => (
  <Card className="p-4 border-gray-200">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-[#0F172A]">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{detail}</p>
      </div>
      <div className="rounded-lg bg-[#E6F4F4] p-2 text-[#008C91]">{icon}</div>
    </div>
  </Card>
);

const EngagementTab = ({ data }: EngagementProps) => {
  const analysis = data?.viewingAnalysis;
  const metrics = analysis?.metrics;
  const isUnavailable = !analysis || analysis.status === "unavailable";
  const isNoData = analysis?.status === "no_data";

  if (isUnavailable) {
    return (
      <div className="m-0 p-4">
        <Card className="border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <h3 className="font-semibold text-amber-900">
                Viewing Analysis unavailable
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                {analysis?.reason ||
                  "No linked student account or course activity source was found."}
              </p>
              <p className="mt-3 text-xs text-amber-700">
                No engagement score or viewing figures are shown until the
                underlying platform data is available.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const completion =
    metrics?.completionRate === null || metrics?.completionRate === undefined
      ? "—"
      : `${metrics.completionRate}%`;

  return (
    <div className="m-0 space-y-4 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Viewing Analysis
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Recorded learning-platform activity for this student and course.
          </p>
        </div>
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            isNoData
              ? "bg-gray-100 text-gray-600"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isNoData ? (
            <Info className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {isNoData ? "No data recorded" : "Data available"}
        </div>
      </div>

      {isNoData && (
        <Card className="border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-900">
            No viewing or assessment activity has been recorded for this
            student yet. This is different from a failed or zero engagement
            score.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tracked content"
          value={metrics ? String(metrics.trackedContent) : "—"}
          detail="Content with recorded progress"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          label="Tracked completion"
          value={completion}
          detail={
            metrics
              ? `${metrics.completedContent} completed item(s)`
              : "No progress data"
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Assessments submitted"
          value={metrics ? String(metrics.submittedAssessments) : "—"}
          detail={
            metrics?.averageAssessmentScore === null ||
            metrics?.averageAssessmentScore === undefined
              ? "No score available"
              : `Average score ${metrics.averageAssessmentScore}%`
          }
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Last activity"
          value={formatDate(analysis.lastActivityAt)}
          detail={`Last login: ${formatDate(analysis.lastLoginAt)}`}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <Card className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-[#0F172A]">Activity trend</h3>
          <p className="text-xs text-gray-500">
            Recorded progress and assessment activity by week
          </p>
        </div>
        {analysis.trend && analysis.trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analysis.trend} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activity"
                name="Recorded activity"
                stroke="#008C91"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
            No trend data is available yet.
          </div>
        )}
      </Card>

      <Card className="border-gray-200 bg-gray-50 p-4">
        <p className="text-xs leading-5 text-gray-600">
          <strong>Interpretation:</strong> This view reports recorded platform
          events only. It does not determine attention, understanding or
          learning quality, and it must not be used as a causal explanation
          for academic outcomes.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Source: {analysis.source || "Recorded platform activity"} · Updated{" "}
          {formatDate(analysis.generatedAt)}
        </p>
      </Card>
    </div>
  );
};

export default EngagementTab;
