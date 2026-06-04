/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuths } from "@/hooks/userContext";
import { PortalList } from "@/type/IAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import user from "/public/assets/logo/agent/user-circle.svg";
import notification from "/public/assets/logo/dashboard_management/notification.svg";
import { CookieStore } from "@/lib/CookieStore";

const Profile = () => {
  const auth = useAuths();
  const PortalList = auth?.portalList;
  const activePortal = auth?.user?.portName;
  // console.log("activePortal", activePortal);
  const router = useRouter();

  const handelWitchAccount = (portalName: string) => {
    // logout();

    const updateBody = {
      ...(auth?.user as any),
      portName: portalName,
    };

    //setAccessToken(JSON.stringify(updateBody));
    CookieStore.setCookieClient("authData", updateBody);
    router.push(`/${portalName}`);
    // auth?.setUser(updateBody);

    // console.log("updateBody", updateBody);
    // console.log("portalName", portalName);

    // auth?.logout();
    // auth?.login(updateBody, `/${portalName}`, portalName);
    // console.log("portalName", portalName);

    // auth?.login(...(auth?.user! as any), `/${portalName}`);

    // console.log("portalName", portalName);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer">
            <Image
              src={notification}
              alt="notification"
              width={20}
              height={20}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-3 mt-3 mr-8 min-w-[250px] min-h-[300px]">
          {/* $
          {activePortal === portal.portalName
            ? "!bg-[#133c50] !text-white"
            : "bg-[#011c28]"} */}
          <DropdownMenuGroup>
            {PortalList &&
              PortalList?.map((portal: PortalList) => (
                <TooltipProvider key={portal.portalCategoryId}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        disabled={activePortal === portal.portalName}
                        onClick={() => handelWitchAccount(portal?.portalName)}
                        className={`
                              bg-[#011c28]
                          
                         w-full mt-3 px-4 py-2 text-white cursor-pointer  hover:!bg-[#133c50] hover:!text-white`}
                      >
                        <div className="flex gap-3 justify-start items-center">
                          <div className="">
                            <Image
                              src={user}
                              alt="dashboard"
                              width={24}
                              height={24}
                            />
                          </div>
                          <p> {portal.portalName}</p>
                        </div>
                        {/* <span
                                              className="cursor-pointer"
                                              onClick={() => openUpdateUserHandel(user)}
                                            > */}
                        {/* Update User */}
                        {/* </span> */}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch to {portal.portalName} Portal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;
