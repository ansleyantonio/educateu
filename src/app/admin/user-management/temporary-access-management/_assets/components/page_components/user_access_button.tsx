const accessDotColors: { [key: string]: string } = {
  "Time Based": "bg-yellow-500",
  "Full Access": "bg-blue-500",
  "Limited Access": "bg-purple-500",
  "Manual Revocation": "bg-red-500",
};

const accessStyles: { [key: string]: string } = {
  "Time Based": "bg-yellow-200 text-yellow-700 px-3 py-1 rounded-md",
  "Full Access":
    "bg-[#EAECF0] text-[#026AA2] px-3 py-1 border border-1 border-[#B9E6FE]  rounded-lg",
  "Limited Access": "bg-purple-200 text-purple-700 px-3 py-1 rounded-md",
  "Manual Revocation": "bg-red-200 text-red-700 px-3 py-1 rounded-md",
};

import clsx from "clsx";
import React from "react";

interface UserAccessBadgeProps {
  accessType: string;
}
const UserAccessBadge: React.FC<UserAccessBadgeProps> = ({ accessType }) => {
  return (
    <div
      className={clsx(
        "text-sm font-medium flex justify-between items-center space-x-2",
        accessStyles[accessType as keyof typeof accessStyles]
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          accessDotColors[accessType as keyof typeof accessDotColors]
        )}
      />
      {accessType}
    </div>
  );
};

export default UserAccessBadge;
