/* eslint-disable @typescript-eslint/no-explicit-any */
import dateFormat from "@/utils/DateFormatter";

interface InterviewHistoryProps {
  histories: Array<{
    id: string;
    outcome: string;
    createdAt: string;
    createdBy: {
      userPortalCategory: {
        user: {
          firstName: string;
          lastName: string;
        };
      };
    };
  }>;
}

export function InterviewHistory({ histories }: InterviewHistoryProps) {
  if (histories.length === 0) {
    return (
      <div className="space-y-2">
        <p className="py-1 px-2 text-sm text-center text-red-600 bg-red-200 rounded-md">
          No Interview History
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-w-[110px]">
      {histories.map((history) => (
        <HistoryItem key={history.id} history={history} />
      ))}
    </div>
  );
}

function HistoryItem({ history }: any) {
  const isPassed = history.status === "PASS";

  return (
    <p
      className={`py-1 px-2 text-sm text-center rounded-md ${
        isPassed ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
      }`}
    >
      {history?.title} - {history?.status}ED on{" "}
      {dateFormat.fullDateTime(history?.interviewDate, { showTime: false })}
    </p>
  );
}
