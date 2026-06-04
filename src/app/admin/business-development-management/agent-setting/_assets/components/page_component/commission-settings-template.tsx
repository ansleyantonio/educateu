// "use client";

// import { useState } from "react";
// import { useAuths } from "@/hooks/userContext";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { FaPlus } from "react-icons/fa6";
// import { GroupModal } from "./group_modal";
// import { CommissionAccordion } from "./commission_accordion";
// import { fetchAllCommissionGroups } from "../../query_controller/fetchAllCommissionGroups";
// import { Button } from "@/components/ui/custom_ui/button";
// // import { useDownloadCommissionTemplate } from "../../query_controller/downloadTemplate";

// type Commission = {
//   id: string;
//   rate: number;
//   bonus: number;
//   studentRangeLower: number;
//   studentRangeUpper: number;
// };

// type CommissionGroup = {
//   commissionGroupId: string;
//   commissionGroupName: string;
//   type: "INTERNAL" | "EXTERNAL";
//   commissions: Commission[];
// };

// type CommissionSettingsTemplateProps = {
//   hasPostAndDeletePermission?: boolean;
// };

// import { useMutation } from "@tanstack/react-query";
// import { downloadCommissionTemplate } from "../../query_controller/downloadTemplate";

// export const useDownloadCommissionTemplate = () => {
//   return useMutation({
//     mutationFn: downloadCommissionTemplate,
//   });
// };

// export const CommissionSettingsTemplate = ({
//   hasPostAndDeletePermission,
// }: CommissionSettingsTemplateProps) => {
//   const [activeDialog, setActiveDialog] = useState<
//     "internal" | "external" | null
//   >(null);

//   const user = useAuths();
//   const token = user?.user?.token;

//   const queryClient = useQueryClient();

//   const { data: internalGroupsData, isLoading: isLoadingInternal } = useQuery({
//     queryKey: [
//       "fetch-list-of-all-commission-internal-groups",
//       {
//         type: "internal",
//         token,
//       },
//     ],
//     queryFn: fetchAllCommissionGroups,
//   });

//   const { data: externalGroupsData, isLoading: isLoadingExternal } = useQuery({
//     queryKey: [
//       "fetch-list-of-all-commission-external-groups",
//       {
//         type: "external",
//         token,
//       },
//     ],
//     queryFn: fetchAllCommissionGroups,
//   });

//   // console.log("External Commission Data", externalGroupsData?.data);

//   // const [internalGroups, setInternalGroups] = useState<string[]>([]);
//   // const [externalGroups, setExternalGroups] = useState<string[]>([]);
//   const { mutate: downloadInternalTemplate, isPending: isDownloadingInternal } =
//     useDownloadCommissionTemplate();

//   const { mutate: downloadExternalTemplate, isPending: isDownloadingExternal } =
//     useDownloadCommissionTemplate();

//   return (
//     <Card className="mt-6">
//       <CardHeader className="py-3 bg-[#F5F7F9]">
//         <CardTitle className="font-semibold text-xl text-[#272E35]">
//           Commission Settings
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="w-full pt-4">
//         <div className="space-y-2">
//           {/*  Internal Agent Commission Rate Template */}
//           <div className="flex flex-col">
//             <div className="flex justify-between items-center mt-4 mb-4">
//               <Label className="font-medium text-md">
//                 Internal Agent Commission Rate Template
//               </Label>
//               <div className="flex space-x-4">
//                 {/* <Button variant="outline" >Download</Button> */}
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   onClick={() =>
//                     token &&
//                     downloadInternalTemplate({
//                       token,
//                       templateType: "INTERNAL",
//                     })
//                   }
//                   disabled={isDownloadingInternal || !hasPostAndDeletePermission}
//                   className={`${
//                     !hasPostAndDeletePermission ? "opacity-50" : ""
//                   }`}
//                 >
//                   {isDownloadingInternal ? "Downloading..." : "Download"}
//                 </Button>
//                 <div
//                   className={
//                     !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
//                   }
//                 >
//                   <Button
//                     variant="primary"
//                     size="lg"
//                     onClick={() => setActiveDialog("internal")}
//                     disabled={!hasPostAndDeletePermission}
//                     className={`${
//                       !hasPostAndDeletePermission ? "opacity-50" : ""
//                     }`}
//                   >
//                     <FaPlus className="w-6 h-6 mr-2" />
//                     Create Group
//                   </Button>
//                 </div>
//               </div>
//             </div>
//   <div className="overflow-auto max-h-[258px]">
//             {internalGroupsData?.data?.map(
//               (group: CommissionGroup, index: number) => (
//                 <CommissionAccordion
//                   key={index}
//                   groupType="internal"
//                   //onDialogOpen={(type) => setActiveDialog(type)}
//                   group={group}
//                   isLoading={isLoadingInternal}
//                   refetchGroups={() =>
//                     queryClient.invalidateQueries({
//                       queryKey: [
//                         "fetch-list-of-all-commission-internal-groups",
//                       ],
//                     })
//                   }
//                 />
//               )
//             )}
//             </div>
//           </div>
//           {/*  Internal Agent Commission Rate Template */}

//           {/* External Agent Commission Rate Template */}
//           <div className="flex flex-col">
//             <div className="flex justify-between items-center mt-4  mb-4">
//               <Label className="font-medium text-md">
//                 External Agent Commission Rate Template
//               </Label>
//               <div className="flex space-x-4">
//                 {/* <Button variant="outline" >Download</Button> */}
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   onClick={() =>
//                     token &&
//                     downloadExternalTemplate({
//                       token,
//                       templateType: "EXTERNAL",
//                     })
//                   }
//                   disabled={isDownloadingInternal || !hasPostAndDeletePermission}
//                   className={`${
//                     !hasPostAndDeletePermission ? "opacity-50" : ""
//                   }`}
//                 >
//                   {isDownloadingExternal ? "Downloading..." : "Download"}
//                 </Button>
//                 {/* <button
//                   className="bg-[#013E5B] text-white p-3 rounded-md self-end flex items-center justify-center"
//                   onClick={() => setActiveDialog("external")}
//                 >
//                   <FaPlus className="w-6 h-6 mr-2" />
//                   Create Group
//                 </button> */}
//                 <div
//                   className={
//                     !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
//                   }
//                 >
//                   <Button
//                     variant="primary"
//                     size="lg"
//                     onClick={() => setActiveDialog("external")}
//                     disabled={!hasPostAndDeletePermission}
//                     className={`${
//                       !hasPostAndDeletePermission ? "opacity-50" : ""
//                     }`}
//                   >
//                     <FaPlus className="w-6 h-6 mr-2" />
//                     Create Group
//                   </Button>
//                 </div>
//               </div>
//             </div>
            
//             <div className="overflow-auto max-h-[258px]">
//             {externalGroupsData?.data?.map(
//               (group: CommissionGroup, index: number) => (
//                 <CommissionAccordion
//                   key={group.commissionGroupId}
//                   groupType="external"
//                   //onDialogOpen={(type) => setActiveDialog(type)}
//                   group={group}
//                   isLoading={isLoadingExternal}
//                   refetchGroups={() =>
//                     queryClient.invalidateQueries({
//                       queryKey: [
//                         "fetch-list-of-all-commission-external-groups",
//                       ],
//                     })
//                   }
//                 />
//               )
//             )}
//             </div>
//           </div>
//           {/* External Agent Commission Rate Template */}
//         </div>
//       </CardContent>

//       {activeDialog && token && (
//         <GroupModal
//           isOpen={true}
//           // groupType={activeDialog}
//           groupType={activeDialog.toUpperCase() as "INTERNAL" | "EXTERNAL"}
//           token={token}
//           onClose={() => setActiveDialog(null)}
//           onCreate={(groupName: string) => {
//             if (activeDialog === "internal") {
//               // setInternalGroups((prev) => [...prev, groupName]);
//               queryClient.invalidateQueries({
//                 queryKey: ["fetch-list-of-all-commission-internal-groups"],
//               });
//             } else if (activeDialog === "external") {
//               // setExternalGroups((prev) => [...prev, groupName]);
//               queryClient.invalidateQueries({
//                 queryKey: ["fetch-list-of-all-commission-external-groups"],
//               });
//             }
//             setActiveDialog(null);
//           }}
//         />
//       )}
//     </Card>
//   );
// };
"use client";

import { useState } from "react";
import { useAuths } from "@/hooks/userContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FaPlus } from "react-icons/fa6";
import { GroupModal } from "./group_modal";
import { CommissionAccordion } from "./commission_accordion";
import { fetchAllCommissionGroups } from "../../query_controller/fetchAllCommissionGroups";
import { Button } from "@/components/ui/custom_ui/button";
// import { useDownloadCommissionTemplate } from "../../query_controller/downloadTemplate";

type Commission = {
  id: string;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
  studentRangeLower: number;
  studentRangeUpper: number;
};

type CommissionGroup = {
  commissionGroupId: string;
  commissionGroupName: string;
  type: "INTERNAL" | "EXTERNAL";
  bonus: number;
  studentLimit: number;
  commissions: Commission[];
};

type CommissionSettingsTemplateProps = {
  hasPostAndDeletePermission?: boolean;
};

import { useMutation } from "@tanstack/react-query";
import { downloadCommissionTemplate } from "../../query_controller/downloadTemplate";
import ActionButton from "@/components/common/button/actionButton";

export const useDownloadCommissionTemplate = () => {
  return useMutation({
    mutationFn: downloadCommissionTemplate,
  });
};

export const CommissionSettingsTemplate = ({
  hasPostAndDeletePermission,
}: CommissionSettingsTemplateProps) => {
  const [activeDialog, setActiveDialog] = useState<
    "internal" | "external" | null
  >(null);

  const user = useAuths();
  const token = user?.user?.token;

  const queryClient = useQueryClient();

  const { data: internalGroupsData, isLoading: isLoadingInternal } = useQuery({
    queryKey: [
      "fetch-list-of-all-commission-internal-groups",
      {
        type: "internal",
        token,
      },
    ],
    queryFn: fetchAllCommissionGroups,
  });

  const { data: externalGroupsData, isLoading: isLoadingExternal } = useQuery({
    queryKey: [
      "fetch-list-of-all-commission-external-groups",
      {
        type: "external",
        token,
      },
    ],
    queryFn: fetchAllCommissionGroups,
  });

  // console.log("External Commission Data", externalGroupsData?.data);

  // const [internalGroups, setInternalGroups] = useState<string[]>([]);
  // const [externalGroups, setExternalGroups] = useState<string[]>([]);
  const { mutate: downloadInternalTemplate, isPending: isDownloadingInternal } =
    useDownloadCommissionTemplate();

  const { mutate: downloadExternalTemplate, isPending: isDownloadingExternal } =
    useDownloadCommissionTemplate();

  return (
    <Card className="mt-6">
      <CardHeader className="py-3 bg-[#F5F7F9]">
        <CardTitle className="font-semibold text-xl text-[#272E35]">
          Commission Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-2 lg:px-6">
        <div className="space-y-2">
          {/*  Internal Agent Commission Rate Template */}
          <div className="flex flex-col">
            <div className="flex md:flex-col lg:flex-row lg:justify-between lg:items-center mt-4 mb-4 gap-2">
              <Label className="font-medium text-md">
                Internal Agent Commission Rate Template
              </Label>
              <div className="flex space-x-4">
                {/* <Button variant="outline" >Download</Button> */}
                <ActionButton
                  btnSize="lg"
                  handleOpen={() =>
                    token &&
                    downloadInternalTemplate({
                      token,
                    templateType: "INTERNAL",
                    })
                  }
                  buttonContent="Download"
                  loadingContent="Downloading..."
                  isPending={isDownloadingInternal}
                  disabled={isDownloadingInternal || !hasPostAndDeletePermission}
                  btnStyle={`${
                    !hasPostAndDeletePermission ? "opacity-50" : ""
                  }`}
                />
                <div
                  className={
                    !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
                  }
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setActiveDialog("internal")}
                    disabled={!hasPostAndDeletePermission}
                    className={`${
                      !hasPostAndDeletePermission ? "opacity-50" : ""
                    }`}
                  >
                    <FaPlus className="w-6 h-6 mr-2" />
                    Create Internal Group
                  </Button>
                </div>
              </div>
            </div>
  <div className="overflow-auto max-h-[258px]">
            {internalGroupsData?.data?.map(
              (group: CommissionGroup, index: number) => (
                <CommissionAccordion
                  key={index}
                  groupType="internal"
                  //onDialogOpen={(type) => setActiveDialog(type)}
                  group={group}
                  isLoading={isLoadingInternal}
                  refetchGroups={() =>
                    queryClient.invalidateQueries({
                      queryKey: [
                        "fetch-list-of-all-commission-internal-groups",
                      ],
                    })
                  }
                />
              )
            )}
            </div>
          </div>

          {/* External Agent Commission Rate Template */}
          <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-4 mb-4 gap-2">
              <Label className="font-medium text-md">
                External Agent Commission Rate Template
              </Label>
              <div className="flex space-x-4">
                {/* <Button variant="outline" >Download</Button> */}
                <ActionButton
                  btnSize="lg"
                  handleOpen={() =>
                    token &&
                    downloadExternalTemplate({
                      token,
                      templateType: "EXTERNAL",
                    })
                  }
                  buttonContent="Download"
                  loadingContent="Downloading..."
                  isPending={isDownloadingExternal}
                  disabled={isDownloadingExternal || !hasPostAndDeletePermission}
                  btnStyle={`${
                    !hasPostAndDeletePermission ? "opacity-50" : ""
                  }`}
                />
                {/* <button
                  className="bg-[#013E5B] text-white p-3 rounded-md self-end flex items-center justify-center"
                  onClick={() => setActiveDialog("external")}
                >
                  <FaPlus className="w-6 h-6 mr-2" />
                  Create Group
                </button> */}
                <div
                  className={
                    !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
                  }
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setActiveDialog("external")}
                    disabled={!hasPostAndDeletePermission}
                    className={`${
                      !hasPostAndDeletePermission ? "opacity-50" : ""
                    }`}
                  >
                    <FaPlus className="w-6 h-6 mr-2" />
                    Create External Group
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-auto max-h-[258px]">
            {externalGroupsData?.data?.map(
              (group: CommissionGroup, index: number) => (
                <CommissionAccordion
                  key={group.commissionGroupId}
                  groupType="external"
                  //onDialogOpen={(type) => setActiveDialog(type)}
                  group={group}
                  isLoading={isLoadingExternal}
                  refetchGroups={() =>
                    queryClient.invalidateQueries({
                      queryKey: [
                        "fetch-list-of-all-commission-external-groups",
                      ],
                    })
                  }
                />
              )
            )}
            </div>
          </div>
          {/* External Agent Commission Rate Template */}
        </div>
      </CardContent>

      {activeDialog && token && (
        <GroupModal
          isOpen={true}
          // groupType={activeDialog}
          groupType={activeDialog.toUpperCase() as "INTERNAL" | "EXTERNAL"}
          token={token}
          onClose={() => setActiveDialog(null)}
          onCreate={(groupName: string) => {
            if (activeDialog === "internal") {
              // setInternalGroups((prev) => [...prev, groupName]);
              queryClient.invalidateQueries({
                queryKey: ["fetch-list-of-all-commission-internal-groups"],
              });
            } else if (activeDialog === "external") {
              // setExternalGroups((prev) => [...prev, groupName]);
              queryClient.invalidateQueries({
                queryKey: ["fetch-list-of-all-commission-external-groups"],
              });
            }
            setActiveDialog(null);
          }}
        />
      )}
    </Card>
  );
};
