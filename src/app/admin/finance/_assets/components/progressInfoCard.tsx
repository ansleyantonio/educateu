import formatCurrency from "@/utils/formateCurrency";
import { Dot, MoveUp } from "lucide-react";

interface ProgressInfoCardProps {
  title?: string;
  amount: string;
  progress: string;
  tag: string;
}

const ProgressInfoCard = ({ data }: { data: ProgressInfoCardProps }) => {
  const { tag, amount, progress, title } = data;

  // 1. Define base styles
  const baseStyles = {
    green: {
      text: "text-green-800",
      border: "border-l-green-800",
      bg: "bg-green-50",
    },
    yellow: {
      text: "text-yellow-600",
      border: "border-l-yellow-600",
      bg: "bg-yellow-50",
    },
    red: {
      text: "text-red-800",
      border: "border-l-red-800",
      bg: "bg-red-50",
    },
    gray: {
      text: "text-gray-700",
      border: "border-l-gray-400",
      bg: "bg-gray-50",
    },
  };

  // 2. Function to detect status/category keywords
  function getTagStyle(tag: string) {
    const lower = tag.toLowerCase();

    if (
      ["paid", "success", "approved", "approved payments"].some((k) =>
        lower.includes(k),
      )
    ) {
      return baseStyles.green;
    }
    if (["installment", "pending", "invoice"].some((k) => lower.includes(k))) {
      return baseStyles.yellow;
    }
    if (["overdue", "clawback"].some((k) => lower.includes(k))) {
      return baseStyles.red;
    }

    // fallback (neutral gray for generic categories like Total Agent)
    return baseStyles.gray;
  }

  // 3. Use inside your component
  const styles = getTagStyle(tag);

  return (
    <div
      className={`p-4 ${styles.border} py-4 space-y-2 rounded-xl border border-l-2 shadow-lg`}
    >
      {/* Title */}
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${styles.text}`}>{tag}</h3>
        <Dot className={styles.text} size={40} strokeWidth={3} />
      </div>

      {/* Amount */}
      <h1 title={amount} className="text-xl font-bold max-w-[75%] truncate">
        {formatCurrency(amount)}
      </h1>

      {/* Progress */}
      <div
        className={`flex ${title ? "justify-between" : "justify-end"} items-center`}
      >
        {title && <p className="text-sm text-gray-500">{title}</p>}
        <div
          className={`flex gap-1 items-center ${styles.text} ${styles.bg} rounded-full px-3 py-1`}
        >
          <MoveUp size={16} strokeWidth={3} />
          <p className="text-sm">{progress}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressInfoCard;
