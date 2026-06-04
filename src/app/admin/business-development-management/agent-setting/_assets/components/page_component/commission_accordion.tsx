// "use client";

// import { useState } from "react";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { AgentCommissionRateDialog } from "./agent_commission_rate_dialog";
// import { AssignAgentDialog } from "./assign_agent_dialog";
// import { UpdateCommissionDialogName } from "./update_commission_dialog_name";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/custom_ui/button";
// import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
// import { getUserAccess } from "@/utils/permissions/permissions";

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

// type CommissionAccordionProps = {
//   groupType: "internal" | "external";
//   group: CommissionGroup;
//   isLoading: boolean;
//   refetchGroups: () => void;
// };

// export const CommissionAccordion = ({
//   groupType,
//   group,
//   isLoading,
//   refetchGroups,
// }: CommissionAccordionProps) => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<CommissionGroup | null>(null);
//   const [isUpdateGroupModalOpen, setIsUpdateGroupModalOpen] = useState(false);

//   const matchedModule = useMatchedModule();

//   const permissions = matchedModule?.modulePermission || [];
//   const accessLevel = getUserAccess(permissions);
//   const hasPostAndDeletePermission = accessLevel === "full-access";

//   const handleDialogOpen = () => {
//     setSelectedGroup(group);
//     setIsDialogOpen(true);
//   };

//   const handleDialogClose = () => {
//     setIsDialogOpen(false);
//   };

//   const handleAssignDialogOpen = () => setIsAssignDialogOpen(true);
//   const handleAssignDialogClose = () => setIsAssignDialogOpen(false);

//   const handleUpdateDialogOpen = () => {
//     setIsUpdateGroupModalOpen(true);
//   };

//   const handleUpdateDialogClose = () => {
//     setIsUpdateGroupModalOpen(false);
//   };

//   return (
//     <>
//       {isLoading ? (
//         <div className="flex justify-center items-center my-8">
//           <Loader2 className="animate-spin" />
//         </div>
//       ) : (
//         <>
//           <Accordion
//             type="single"
//             collapsible
//             className="w-full bg-[#F5F7F9] rounded-xl border border-[#E2E8F0] mt-2"
//           >
//             <AccordionItem value={`${groupType}-${group.commissionGroupName}`}>
//               <AccordionTrigger className="flex justify-between items-center p-5">
//                 <p className="font-medium text-xl text-[#272E35]">
//                   Group {group.commissionGroupName}
//                 </p>
//                 <div className="flex space-x-4 ml-auto">
//                   <Button
//                     variant="outline"
//                     className="rounded-full"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDialogOpen();
//                     }}
//                     disabled={!hasPostAndDeletePermission}
//                   >
//                     {group.commissions.length > 0 ? "Update Scheme" : "Assign Scheme"}
//                   </Button>

//                   <Button
//                     variant="outline"
//                     className="rounded-full"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleAssignDialogOpen();
//                     }}
//                     disabled={!hasPostAndDeletePermission}
//                   >
//                     Assign Agent
//                   </Button>

//                   <Button
//                     variant="outline"
//                     className="rounded-full"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleUpdateDialogOpen();
//                     }}
//                     disabled={!hasPostAndDeletePermission}
//                   >
//                     Update Group Name
//                   </Button>
//                 </div>
//                 <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CFD6DD] hidden data-[state=open]:block" />
//               </AccordionTrigger>
//               <AccordionContent>
//                 <Table className="border-r border-b border-collapse table-auto bg-[#FFFFFF]">
//                   <TableHeader className="bg-[#F9FAFB]">
//                     <TableRow>
//                       <TableHead className="w-1/3 text-center">Student Range</TableHead>
//                       <TableHead className="w-1/3 text-center">Rate</TableHead>
//                       <TableHead className="w-1/3 text-center">Bonus</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {group.commissions.length > 0 ? (
//                       group.commissions.map((commission: Commission) => (
//                         <TableRow key={commission.id}>
//                           <TableCell className="text-center">
//                             {commission.studentRangeLower} - {commission.studentRangeUpper}
//                           </TableCell>
//                           <TableCell className="text-center">{commission.rate}%</TableCell>
//                           <TableCell className="text-center">
//                             {commission.bonus ?? "-"}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell className="text-center" colSpan={3}>
//                           No commissions available.
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </AccordionContent>
//             </AccordionItem>
//           </Accordion>

//           <AgentCommissionRateDialog
//             isOpen={isDialogOpen}
//             onClose={handleDialogClose}
//             groupType={groupType}
//             group={selectedGroup}
//             refetchGroups={refetchGroups}
//           />

//           <AssignAgentDialog
//             isOpen={isAssignDialogOpen}
//             onClose={handleAssignDialogClose}
//             groupType={groupType}
//             commissionGroupId={group.commissionGroupId}
//             onAssign={(selected) => console.log("Assigned:", selected)}
//           />

//           <UpdateCommissionDialogName
//             isOpen={isUpdateGroupModalOpen}
//             onClose={handleUpdateDialogClose}
//             commissionGroupId={group.commissionGroupId}
//             commissionGroupName={group.commissionGroupName}
//             refetchGroups={refetchGroups}
//           />
//         </>
//       )}
//     </>
//   );
// };
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentCommissionRateDialog } from "./agent_commission_rate_dialog";
import { AssignAgentDialog } from "./assign_agent_dialog";
import { UpdateCommissionDialogName } from "./update_commission_dialog_name";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/custom_ui/button";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

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

type CommissionAccordionProps = {
  groupType: "internal" | "external";
  group: CommissionGroup;
  isLoading: boolean;
  refetchGroups: () => void;
};

export const CommissionAccordion = ({
  groupType,
  group,
  isLoading,
  refetchGroups,
}: CommissionAccordionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CommissionGroup | null>(
    null
  );
  const [isUpdateGroupModalOpen, setIsUpdateGroupModalOpen] = useState(false);

  const matchedModule = useMatchedModule();

  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  const handleDialogOpen = () => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleAssignDialogOpen = () => setIsAssignDialogOpen(true);
  const handleAssignDialogClose = () => setIsAssignDialogOpen(false);

  const handleUpdateDialogOpen = () => {
    setIsUpdateGroupModalOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setIsUpdateGroupModalOpen(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <Accordion
            type="single"
            collapsible
            className="w-full bg-[#F5F7F9] rounded-xl border border-[#E2E8F0] mt-2"
          >
            <AccordionItem value={`${groupType}-${group.commissionGroupName}`}>
              <AccordionTrigger className="p-5">
                <div className="flex flex-wrap lg:justify-between gap-2 flex-1">
                  <p className="font-medium text-xl text-[#272E35]">
                    Group {group.commissionGroupName}
                  </p>

                  <div className="flex gap-4 ml-auto">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDialogOpen();
                      }}
                      disabled={!hasPostAndDeletePermission}
                    >
                      {group.commissions.length > 0
                        ? "Update Scheme"
                        : "Assign Scheme"}
                    </Button>

                    {/* <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignDialogOpen();
                    }}
                    disabled={!hasPostAndDeletePermission}
                  >
                    Assign Agent
                  </Button> */}

                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateDialogOpen();
                      }}
                      disabled={!hasPostAndDeletePermission}
                    >
                      Update Group Name
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CFD6DD] hidden data-[state=open]:block" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table className="border-r border-b border-collapse table-auto bg-[#FFFFFF]">
                  <TableHeader className="bg-[#F9FAFB]">
                    <TableRow>
                      <TableHead
                        colSpan={2}
                        className="text-center border-r border-gray-200"
                      >
                        Student Range
                      </TableHead>
                      <TableHead
                        colSpan={4}
                        className="text-center border-r border-gray-200"
                      >
                        Commission Rate
                      </TableHead>
                      <TableHead className="text-center">Bonus</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="text-center border-r border-gray-200">
                        Lower Limit
                      </TableHead>
                      <TableHead className="text-center border-r border-gray-200">
                        Upper Limit
                      </TableHead>
                      <TableHead className="text-center border-r border-gray-200">
                        1st Year
                      </TableHead>
                      <TableHead className="text-center border-r border-gray-200">
                        2nd Year
                      </TableHead>
                      <TableHead className="text-center border-r border-gray-200">
                        3rd Year
                      </TableHead>
                      <TableHead className="text-center border-r border-gray-200">
                        4th Year
                      </TableHead>
                      {/* <TableHead className="text-center"></TableHead> */}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {group.commissions.length > 0 ? (
                      <>
                        {group.commissions.map(
                          (commission: Commission, index) => (
                            <TableRow key={commission.id}>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.studentRangeLower}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.studentRangeUpper}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.rate1
                                  ? `${commission.rate1}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.rate2
                                  ? `${commission.rate2}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.rate3
                                  ? `${commission.rate3}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-200">
                                {commission.rate4
                                  ? `${commission.rate4}%`
                                  : "N/A"}
                              </TableCell>

                              {/* Bonus cell only once, spanning all rows */}
                              {index === 0 && (
                                <TableCell
                                  rowSpan={group.commissions.length}
                                  className="border-none text-center font-medium text-wrap"
                                >
                                  {group.bonus
                                    ? `Bonus €${group?.bonus} when student is enrolled over ${group?.studentLimit} `
                                    : "No bonus available"}
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        )}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell className="text-center" colSpan={7}>
                          No commissions available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <AgentCommissionRateDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            groupType={groupType}
            group={selectedGroup}
            refetchGroups={refetchGroups}
          />

          {/* <AssignAgentDialog
            isOpen={isAssignDialogOpen}
            onClose={handleAssignDialogClose}
            groupType={groupType}
            commissionGroupId={group.commissionGroupId}
            onAssign={(selected) => console.log("Assigned:", selected)}
          /> */}

          <UpdateCommissionDialogName
            isOpen={isUpdateGroupModalOpen}
            onClose={handleUpdateDialogClose}
            commissionGroupId={group.commissionGroupId}
            commissionGroupName={group.commissionGroupName}
            refetchGroups={refetchGroups}
          />
        </>
      )}
    </>
  );
};
