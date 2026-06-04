"use client";

import IconShow from "@/app/admin/_assets/components/root_layout/side_bar_menu/iconShow";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuths } from "@/hooks/userContext";
import { InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import ProfileViewForm from "./_assets/components/pageComponents/profile_view_form";
import security from "/public/assets/logo/agent/security-password.svg";

const AgentProfile = () => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const id = auth?.user?.userId as string;
  const role = auth?.user?.roleName as string;
  // console.log("Test User", auth?.user);

  const { data, isLoading } = useFetchData({
    queryKey: "agent-profile",
    // path: `business-development-management/${id}`,
    path: `agent/${id}`,
    method: "GET",
    enabled: !!id && !!token,
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["agent-profile", { token, id }],
  //   queryFn: getUserProfileController,
  //   enabled: !!token && !!id,
  // });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="overflow-y-auto h-[calc(100vh-100px)]">
      <div className="flex justify-end py-4 px-6">
        <div
          className="flex flex-col justify-end items-center w-10 h-10"
          // title="log and Change Password"
        >
          <Link
            href="/agent/password"
            className={`flex  gap-2 xl:gap-3 w-full h-full items-center justify-start p-2 xl:p-3 rounded-md bg-black  transition-all hover:bg-[#002F45]`}
          >
            <IconShow
              navigation={false}
              path={security}
              alt={"security"}
              name={"log and change password"}
            />
          </Link>
        </div>
      </div>
      <ProfileViewForm
        role={role}
        agentInfo={{
          ...data?.data,
          awardingBody: data?.data?.awardingBodyTemplates?.length,
        }}
        token={token}
        id={id}
      />

      {/* Alert */}
      <div className="flex gap-x-2 justify-start items-center px-6 pb-6 mt-8">
        <InfoIcon className="w-5 h-5" />
        <h1 className="text-sm font-semibold leading-5 text-[#555F6D]">
          <span> To modify</span>
          &nbsp;
          <span className="font-bold text-[#272E35]">
            campus, course, intake, year of entry or study preferences,
          </span>
          you will be required to reset course details.
        </h1>
      </div>
    </ScrollArea>
  );
};

export default AgentProfile;
