import { Search } from "lucide-react";
import Image from "next/image";
import help from "/public/assets/logo/dashboard_management/help.svg";
import notification from "/public/assets/logo/dashboard_management/notification.svg";

const ApplicantHeader = () => {
  return (
    <div className="bg-white rounded-t-lg border-b-1 h-[58px]">
      <div className="flex justify-between items-center p-2 pr-4">
        {/* Search Input */}
        <div className="flex gap-2 items-center py-2 px-4 bg-white rounded-lg border shadow-lg w-[300px]">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search"
            className="flex-grow text-black bg-transparent outline-none placeholder:text-gray-500"
          />
        </div>
        {/* Icons */}
        <div className="flex gap-3 cursor-pointer">
          <Image src={help} alt="Help" width={20} height={20} />
          <Image src={notification} alt="Notification" width={20} height={20} />
        </div>
      </div>
    </div>
  );
};

export default ApplicantHeader;
