/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils";
import { GoDotFill } from "react-icons/go";

// Status color map
const statusColorMap: Record<string, string> = {
  paid: "#22C55E", // green
  published: "#22C55E", // green
  active: "#22C55E", // green
  pass: "#22C55E", // green
  passed: "#22C55E", // green
  approved: "#22C55E", // green
  success: "#10B981", // teal
  temporarily_active: "#81f9ad", // green
  pending: "#EAB308", // amber
  upcoming: "#EAB308", // orange
  unpublished: "#EAB308", // orange
  incomplete: "#EF4444", // red
  completed: "#3B82F6", // blue
  booked: "#3B82F6", // blue
  canceled: "#6B7280", // gray
  fail: "#DC2626", // dark red
  failed: "#DC2626", // dark red
  expired: "#DC2626", // dark red
  rejected: "#DC2626", // dark red
  inactive: "#DC2626", // dark red
  suspended: "#DC2626", // dark red
  closed: "#DC2626", // dark red

  // Tier
  platinum: "#9B51E0", // purple
  gold: "#F97316", // orange
  silver: "#A5B4FC", // blue
  bronze: "#F59E0B", // yellow

  default: "#D0D5DD", // light gray
};
//     case "Platinum":
//       return "bg-purple-100 text-purple-800";
//     case "Gold":
//       return "bg-yellow-100 text-yellow-800";
//     case "Silver":
//       return "bg-gray-100 text-gray-800";
//     case "Bronze":
//       return "bg-orange-100 text-orange-800";
//     case "No Tier":
//       return "bg-slate-100 text-slate-800";

// Get main status color
export function getStatusColor(status: string): string {
  return statusColorMap[status?.toLowerCase()] || statusColorMap.default;
}

// Generate a light background color from main color
function getLightBg(color: string, opacity = 0.1): string {
  // Convert hex to rgba with opacity
  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

// Status dot only
interface StatusPointProps {
  status: string;
  className?: string;
}

export function StatusPoint({ status, className }: StatusPointProps) {
  const color = getStatusColor(status);
  return (
    <GoDotFill
      className={cn("-ml-2 w-4 h-4", className)}
      style={
        // Apply dynamic color only if className does NOT include text-*
        className && /text-/.test(className) ? undefined : { color }
      }
    />
  );
}

// Status with optional label and background
interface StatusWithIconProps {
  showIcon?: boolean;
  lastLabel?: string;
  status: string;
  label?: string;
  showBg?: boolean;
  className?: string;
  uppercase?: boolean;
}

export function StatusWithIcon({
  showIcon = true,
  lastLabel,
  status,
  uppercase = true,
  label,
  showBg = false,
  className = "",
}: StatusWithIconProps) {
  const color = getStatusColor(status);
  const bgColor = showBg ? getLightBg(color, 0.15) : "transparent";

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-3 py-1 rounded-xl border capitalize w-fit",
        className,
      )}
      style={{
        borderColor: color,
        backgroundColor: bgColor,
      }}
    >
      {showIcon && <StatusPoint status={status} className={className} />}

      {label && (
        <span className="text-xs font-semibold text-gray-700">{label}:</span>
      )}

      <span
        className={`${uppercase ? "uppercase" : ""} text-xs font-semibold`}
        style={
          // Apply dynamic color only if className does NOT contain text-*
          className && /text-/.test(className) ? undefined : { color }
        }
      >
        {status}
      </span>

      {lastLabel && (
        <span className="text-xs font-semibold text-gray-700">{lastLabel}</span>
      )}
    </div>
  );
}
