import BrowserDeviceHistory from "@/components/common/device_history/browser_device_history";
import { ChangePassword } from "@/components/common/password/change_password/change_password_modal";
import { ScrollArea } from "@/components/ui/scroll-area";
const AgentProfile = () => {
  return (
    <ScrollArea className="overflow-y-auto h-[calc(100vh-100px)]">
      {/* <div className="sticky top-0 z-10 bg-white">
        <AgentManagementHeader />
        <hr />
      </div> */}
      <div className="mt-6 mr-6 rounded-md border border-1 border-[#EAEDF0]">
        <div className="flex justify-between items-center py-4 px-6">
          <h1 className="text-base font-medium leading-6 text-[#000000]">
            Basics Information
          </h1>

          <ChangePassword />
        </div>
        {/* <hr /> */}
        {/* password */}
        {/* <div className="flex justify-between items-center p-6">
          <div className="flex justify-between items-center w-1/2">
            <div className="w-[60%] xl:w-1/2 ">
              <label className="cusFormLabel" htmlFor="subAgentId">
                Password
              </label>
              <p>Set a Password to Protect your Account</p>
            </div>
            <Input defaultValue="12345" type="password" className="flex-1" />
          </div>
          <div>
            <button className="py-2 px-4 rounded-md border shadow-md border-1 border-[#CFD6DD]">
              {" "}
              Edit Details
            </button>
          </div>
        </div> */}
        <hr />
        {/* Two Factor Authentication */}
        {/* <div className="flex justify-between items-center p-6"> */}
        {/*   <div className="flex justify-start items-center w-1/2"> */}
        {/*     <div className="w-1/2"> */}
        {/*       <label className="cusFormLabel" htmlFor="subAgentId"> */}
        {/*         Two Factor Authentication */}
        {/*       </label> */}
        {/*       <p>Set a Password to Protect your Account</p> */}
        {/*     </div> */}
        {/*     <div> */}
        {/*       <Switch id="airplane-mode" /> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* </div> */}
        {/* <hr /> */}
        {/* Security Questions */}
        {/* <div className="flex justify-between items-center p-6"> */}
        {/*   <div className="flex justify-between items-center w-1/2"> */}
        {/*     <div className="w-1/2"> */}
        {/*       <label className="cusFormLabel" htmlFor="subAgentId"> */}
        {/*         Security Questions */}
        {/*       </label> */}
        {/*       <p>Set a Password to Protect your Account</p> */}
        {/*     </div> */}
        {/*     <Input defaultValue="text" type="text" className="flex-1" /> */}
        {/*   </div> */}
        {/*   <div> */}
        {/*     <button className="py-2 px-4 rounded-md border shadow-md border-1 border-[#CFD6DD]"> */}
        {/*       {" "} */}
        {/*       Edit Details */}
        {/*     </button> */}
        {/*   </div> */}
        {/* </div> */}
      </div>
      {/* browser and device */}
      <BrowserDeviceHistory />
    </ScrollArea>
  );
};

export default AgentProfile;
