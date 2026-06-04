import { Dot, MoveUp } from "lucide-react";
import { hexToRgba } from "@/utils/colors/colors";

interface StatCardProps {
  title?: string;
  amount: string;
  progress?: string;
  tag: string;
  color?: string;
}

const StatCard = ({ data }: { data: StatCardProps }) => {
  const { tag, amount, progress, title, color } = data;

  const borderStyle = color ? { borderLeft: `6px solid ${color}` } : {};

  const dotStyle = color ? { color } : {};
  const progressStyle = color
    ? { backgroundColor: hexToRgba(color, 0.1), color }
    : { backgroundColor: "#ffffff" };

  const backGroundColor = progress
    ? { backgroundColor: "#ffffff", color }
    : { backgroundColor: hexToRgba(color!, 0.1), color };

  return (
    <div
      className="p-4 py-4 space-y-1 rounded-xl border border-l-4 shadow-lg"
      style={{ ...borderStyle, ...backGroundColor }}
    >
      {/* Title */}
      <div className="flex justify-between items-center">
        <h3 style={{ color: "#013E5B" }} className="text-lg font-semibold">
          {tag}
        </h3>
        <Dot style={dotStyle} size={40} strokeWidth={5} />
      </div>

      {/* Amount */}
      <h1
        title={amount}
        style={{ color: "#272E35" }}
        className="text-base font-bold max-w-[75%] truncate"
      >
        {/* {amount} */}
        {[
          "Estimated Commission",
          "Enrolled (First Payment)",
          "Estimated Clawback",
        ].includes(tag)
          ? `$${amount}.00`
          : amount}
      </h1>

      {/* Progress */}
      <div
        className={`flex ${
          title ? "justify-between" : "justify-end"
        } items-center`}
      >
        {title && <p className="text-sm text-gray-500">{title}</p>}
        {progress && (
          <div
            className="flex gap-1 items-center rounded-full px-3 py-1 font-bold"
            style={progressStyle}
          >
            <MoveUp size={12} strokeWidth={4} />
            <p className="text-sm">{progress}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
