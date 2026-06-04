/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
const ApplicationManagementRadialProgress = ({
  percentage,
  total,
}: {
  percentage: number;
  total: number;
}) => {
  // Ensure percentage is between 0 and 100
  const progress = Math.min(Math.max(percentage * 10, 0), 100);

  // SVG parameters
  const size = 50;
  const strokeWidth = 5;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted-foreground/20"
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          r={radius}
          cx={center}
          cy={center}
        />
        {/* Progress circle */}
        <circle
          className="text-[#013E5B] transition-all duration-500 ease-in-out"
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <span className="absolute text-sm text-[#013E5B] font-bold">
        {percentage}/{total}
      </span>
    </div>
  );
};

export default ApplicationManagementRadialProgress;
