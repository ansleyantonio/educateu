import { TabsTrigger } from "@/components/ui/custom_ui/invitation_tabs";

interface TabWithCountProps {
  value: string;
  label: string;
  onClick: (value: string) => void;
  className?: string;
}

export const TabButton: React.FC<TabWithCountProps> = ({
  value,
  label,
  onClick,
  className = "",
}) => {
  return (
    <TabsTrigger
      onClick={() => onClick(value)}
      value={value}
      className={`inline-flex justify-center items-center p-4 whitespace-nowrap cursor-pointer ${className}`}
    >
      {label}
    </TabsTrigger>
  );
};