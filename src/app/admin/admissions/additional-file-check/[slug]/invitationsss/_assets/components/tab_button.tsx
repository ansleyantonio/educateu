import { TabsTrigger } from "@/components/ui/custom_ui/invitation_tabs";

interface TabWithCountProps {
  value: string;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: (value: string) => void;
}

export const TabButton: React.FC<TabWithCountProps> = ({
  value,
  label,
  count,
  isActive,
  onClick,
}) => {
  return (
    <TabsTrigger
      onClick={() => onClick(value)}
      value={value}
      className="inline-flex justify-center items-center p-4 whitespace-nowrap cursor-pointer"
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 text-[12px] p-2 w-4 h-4 border flex justify-center items-center rounded-full ${
            isActive
              ? "text-[#3062D4] font-medium border-[#3062D4] bg-[#dcedfc]"
              : "text-black border-black"
          } text-md font-thin transition-all opacity-50 focus-visible:outline-none outline-none`}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
};
