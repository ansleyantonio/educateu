// this header for  management dashboard

import { Search } from "lucide-react";
import Image from "next/image";
import help from "/public/assets/logo/dashboard_management/help.svg";
import notification from "/public/assets/logo/dashboard_management/notification.svg";

// agent ManagementHeader component
// This header is used across all routes under the management section of the dashboard.
// It includes a search input for filtering content, and icons for help and notifications.
const AdminHeader = () => {
  return (
    <div className="bg-[#D4D9DF] max-h-[81px] ">
      {/* <div className="w-full pt-2"></div> */}
      <div className="flex justify-between items-center px-8 py-2 bg-white ">
        {/* Search Input */}
        <div className="bg-[#FFFFFF] flex justify-start items-center gap-x-2 w-[300px] px-4 py-2 border border-1 border-[#D4D9DF] rounded-md">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-grow outline-none text-black placeholder:text-gray-500"
          />
        </div>

        <div className="flex gap-x-3">
          {/* Help Icon */}
          <div className="cursor-pointer">
            <Image src={help} alt="message" width={20} height={20} />
          </div>

          {/* Notification Icon */}
          <div className=" cursor-pointer">
            <Image
              src={notification}
              alt="notification"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
