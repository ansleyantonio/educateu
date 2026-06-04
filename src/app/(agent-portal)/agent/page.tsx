"use client";
import { CalendarIcon, Check, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Alert from "/public/assets/logo/dashboard_management/alert.svg";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import { useAuths } from "@/hooks/userContext";
import { useState } from "react";
import Icon from "/public/assets/logo//dashboard_management//image.png";

const AgentHomePage = () => {
  const router = useRouter(); // Initialize useRouter
  const [filterLists, setFilterLists] = useState([]);

  const auth = useAuths();
  const token = auth?.user?.token;
  const agentId = auth?.user?.userId;
  const role = auth?.permission?.roleName;
  const applicationCreateStatus = auth?.user?.applicationCreateStatus;

  //loading when create new application
  const [applicationLoading, setApplicationLoading] = useState(false);

  // create new application mutation
  const createApplicationMutation = useApiMutation({
    path: `application-management`,
    method: "POST",
    onSuccess: (data) => {
      setApplicationLoading(true);
      const newApplicationId =
        data?.data?.["application"].id || data?.data.application.id;

      // console.log("button newApplicationId -------------", newApplicationId);
      if (newApplicationId) {
        router.push(`/agent/application-management/create/${newApplicationId}`); // Redirect to the new application page
      } else {
        console.error("Application created but ID is missing.");
      }
    },
    onError: (error) => {
      setApplicationLoading(false);
      showToast("error", error || "Failed to create application");
    },
  });

  // get single agent
  const { data, isLoading } = useFetchData({
    queryKey: "agent-profile",
    path: `agent/${agentId}`,
    method: "GET",
    enabled: !!agentId && !!token,
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["single-agent", agentId, token],
  //   queryFn: fetchAgentInfo,
  //   enabled: !!token && !!agentId,
  // });

  const {
    totalApplications = 0,
    totalSubagents = 0,
    user = {},
  } = data?.data ?? {};

  const {
    potentialPayment,
    commissionRate,
    activityStatus,
    awardingBodyTemplates,
  } = user;

  const disabled = role === "agent" && activityStatus != "ACTIVE";
  return (
    <div>
      {/* after login agent */}

      {/* profile information */}
      <div className="space-y-3 sm:space-y-0 flex-row sm:flex sm:justify-between items-center py-3">
        <div>
          <div className="flex gap-2 justify-start items-start">
            <div className="relative w-10 h-10">
              <Image
                src={Icon}
                fill
                alt="profile"
                className="object-cover absolute rounded-full"
              />
            </div>
            <div className="">
              <h1 className="text-sm font-semibold leading-6 capitalize text-md text-[#272E35]">
                welcome back ,{" "}
                {auth?.user?.firstName + " " + auth?.user?.lastName}
              </h1>
              <p className="text-sm font-semibold leading-6 text-[#7E8C9A]">
                you have{" "}
                <span className="!font-bold text-[#3062D4]">
                  {0} new notifications
                </span>
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => createApplicationMutation.mutate({})}
          // onClick={handleCreateNewApplication}
          disabled={
            createApplicationMutation.isPending ||
            applicationLoading ||
            disabled ||
            applicationCreateStatus === "disable"
          }
        >
          <Plus className="w-4 h-4" />
          Create New Application
          {createApplicationMutation.isPending ||
            (applicationLoading && (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ))}
        </Button>
      </div>

      {/* alert section */}
      <div className="flex gap-6 py-4 px-6 h-fit bg-[#FFF5EB]">
        {/* alert icon */}
        <div className="relative w-10 h-10">
          <Image
            src={Alert}
            fill
            alt="agent-management"
            className="object-cover absolute"
          />
        </div>
        {/* short information */}
        <div>
          <div className="text-sm font-semibold leading-6 text-[#272E35]">
            We will not process any application if an applicants mandatory
            documents were not uploaded.*
          </div>
          <div className="mt-2 text-sm font-semibold leading-6 text-[#7F7F86]">
            You must upload ALL required documents for each applicants to enable
            the admissions team to process the application.
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold leading-6 text-[#272E35]">
              Essential Documents
            </p>
            <ul className="flex gap-8 text-sm leading-6 text-[#272E35]">
              <li className="flex gap-2 items-center">• Passport ID</li>
              <li className="flex gap-2 items-center">• Qualifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* box */}
      <div>
        <div className="flex flex-col justify-end items-end mt-4 mr-2">
          {/* <AgentHomePageDataFilter setFilterLists={setFilterLists} /> */}
        </div>

        <div className="space-y-6">
          {/* Warning Alert */}
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4  gap-4 pt-6 pr-2">
            {/* Total Sub Agent */}
            <div className="py-4 px-6 rounded-md border shadow-md border-[#10284817]">
              <div className="flex justify-between items-center pb-4">
                <div className="p-4 rounded-full border border-1 border-[#CFD6DD]">
                  <Check className="w-5 h-5 text-[#272E35]" />
                </div>
                {/* <div className="flex py-2 px-3 text-sm rounded-full bg-[#E6F9E6] text-[#347434]">
                  <span className="text-sm font-normal leading-5"> 25 % </span>

                  <Image
                    src={Increase}
                    width={20}
                    height={20}
                    alt="profile"
                    className=""
                  />
                </div> */}
              </div>
              <p className="text-sm text-muted-foreground">Total Sub Agent</p>
              <p className="mt-2 text-2xl font-semibold text-[#272E35]">
                {totalSubagents}
              </p>
            </div>
            {/* Total Application */}
            <div className="py-4 px-6 rounded-md border shadow-md border-[#10284817]">
              <div className="flex justify-between items-center pb-4">
                <div className="p-4 rounded-full border border-1 border-[#CFD6DD]">
                  <Check className="w-5 h-5 text-[#272E35]" />
                </div>
                {/* <div className="flex py-2 px-3 text-sm rounded-full bg-[#E6F9E6] text-[#347434]">
                  <span className="text-sm font-normal leading-5"> 25 % </span>

                  <Image
                    src={Increase}
                    width={20}
                    height={20}
                    alt="profile"
                    className=""
                  />
                </div> */}
              </div>
              <p className="text-sm text-muted-foreground">Total Application</p>
              <p className="mt-2 text-2xl font-semibold text-[#272E35]">
                {totalApplications}
              </p>
            </div>

            {/* Commission Rate */}
            <div className="py-4 px-6 rounded-md border shadow-md border-[#10284817]">
              <div className="flex justify-between items-center pb-4">
                <div className="p-4 rounded-full border border-1 border-[#CFD6DD]">
                  <Check className="w-5 h-5 text-[#272E35]" />
                </div>
                {/* <div className="flex py-2 px-3 text-sm rounded-full bg-[#E6F9E6] text-[#347434]">
                  <span className="text-sm font-normal leading-5"> 25 % </span>

                  <Image
                    src={Increase}
                    width={20}
                    height={20}
                    alt="profile"
                    className=""
                  />
                </div> */}
              </div>
              <p className="text-sm text-muted-foreground">Awarding Body</p>
              <p className="mt-2 text-2xl font-semibold text-[#272E35]">
                {awardingBodyTemplates?.length}
              </p>
            </div>

            {/* Potential Payout */}
            <div className="py-4 px-6 rounded-md border shadow-md border-[#10284817]">
              <div className="flex justify-between items-center pb-4">
                <div className="p-4 rounded-full border border-1 border-[#CFD6DD]">
                  <Check className="w-5 h-5 text-[#272E35]" />
                </div>
                {/* <div className="flex py-2 px-3 text-sm rounded-full bg-[#E6F9E6] text-[#347434]">
                  <span className="text-sm font-normal leading-5"> 25 % </span>

                  <Image
                    src={Increase}
                    width={20}
                    height={20}
                    alt="profile"
                    className=""
                  />
                </div> */}
              </div>
              <p className="text-sm text-muted-foreground"> Potential Payout</p>
              <p className="mt-2 text-2xl font-semibold text-[#272E35]">
                {potentialPayment}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Updated Of EducateU CRM */}
      <div className="mt-6 mr-2 rounded-md border shadow-md border-[#10284817]">
        <div className="px-8 pt-6 pb-4">
          <h1 className="text-sm  md:text-base font-normals md:font-semibold leading-6 text-[#18181B]">
            Updated Of EducateU CRM
          </h1>
          <p className="text-sm font-normal leading-5 text-[#71717A] pt-[6px]">
            See the updates of EducateU CRM from HubSpot
          </p>
        </div>

        {/* card */}
        <div className="py-4 px-8">
          <div className="flex gap-x-2 justify-start items-start">
            <div className="w-7 h-7 rounded-full border border-1 border-[#E2EBE9]"></div>
            <Card className="w-full">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">
                  Sub-agent has submitted an application
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  <time dateTime="2024-10-17T06:24:00">
                    Oct 17, 2024 • 6:24AM
                  </time>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sub-agent has submitted an application. The application is now
                  in process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHomePage;
