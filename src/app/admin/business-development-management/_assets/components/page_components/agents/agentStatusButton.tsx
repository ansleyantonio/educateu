import { GoDotFill } from "react-icons/go";

const AgentStatusButton = ({ btnName }: { btnName: string }) => {
  const isActive = btnName?.toLowerCase() === "active";

  return (
    <div
      className={`flex gap-1 w-fit text-xs items-center min-w-[90px] py-1 px-2 rounded-md
        ${
          isActive
            ? "bg-[#C6F1DA] text-[#1D7C4D]"
            : "bg-[#DEE3E7] text-[#272E35]"
        }
      `}
    >
      <GoDotFill />
      <p>{btnName}</p>
    </div>
  );
};

export default AgentStatusButton;
