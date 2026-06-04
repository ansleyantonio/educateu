"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import check from "/public/assets/icons/check_ring.svg";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CheckStatusModal = ({ data }: { data: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateCheckStatusMutation = useApiMutation({
    method: "PATCH",
    path: "agent-commissions/mark-paid",
    onSuccess: (responseData) => {
      showToast(
        "success",
        responseData?.message || "Commission marked as paid successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["fetch-agent-commissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-list-of-agents"],
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      showToast(
        "error",
        error?.message || "Failed to update commission status"
      );
      setIsOpen(false);
    },
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate outstanding commission
  const outstandingCommission =
    (data?.eligibleCommission || 0) - (data?.paidCommission || 0);

  // Submit handler
  function onSubmit() {
    if (!data?.agentId) {
      showToast("error", "Agent ID is missing");
      return;
    }

    const body = {
      agentId: data.agentId,
      amount: outstandingCommission,
    };

    updateCheckStatusMutation.mutate(body);
  }

  return (
    <DialogWrapper
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          disabled={
            data?.status === "CHECKED" ||
            // outstandingCommission <= 0 ||
            data?.status === "No Activity"
          }
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={check}
          variant="icon"
          tooltipContent={
            outstandingCommission <= 0
              ? "No outstanding commission"
              : "Mark commission as paid"
          }
        />
      }
      style="min-w-[500px] max-h-[80vh]"
    >
      <div className="space-y-5">
        {/* Header */}
        {/* <div className="flex gap-3 items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900">
              Mark Commission as Paid
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              You&apos;re about to process payment for {data?.agentName}
            </p>
          </div>
        </div> */}

        {/* Agent Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
          <div>
            <p className="text-xs text-slate-600 font-medium">Agent Name</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data?.agentName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{data?.firstName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">
              Commission Tier
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data?.commissionTier}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Total Students</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data?.totalStudent}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Status</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {data?.status}
            </p>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-sm">
            Commission Summary
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-slate-600">Potential</p>
              <p className="text-sm font-bold text-orange-700 mt-1">
                {formatCurrency(data?.potentialCommission || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-slate-600">Eligible</p>
              <p className="text-sm font-bold text-blue-700 mt-1">
                {formatCurrency(data?.eligibleCommission || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-slate-600">Paid</p>
              <p className="text-sm font-bold text-green-700 mt-1">
                {/* {formatCurrency(data?.paidCommission || 0)} */}
                {formatCurrency(data?.totalApprovedInvoices || 0)}
              </p>
            </div>
          </div>

          {/* Outstanding Commission */}
          {/* {outstandingCommission > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-600">
                  Outstanding Commission
                </p>
                <p className="text-lg font-bold text-red-700">
                  {formatCurrency(outstandingCommission)}
                </p>
              </div>
            </div>
          )} */}
        </div>

        {/* Semester Wise Breakdown */}
        {data?.semesterWise && data.semesterWise.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-slate-700" />
              <h4 className="font-semibold text-slate-900 text-sm">
                Semester Wise Commission
              </h4>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data.semesterWise.map((semester: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {semester.semester}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <div>
                        <p className="text-xs text-slate-500">Commission</p>
                        <p className="text-xs font-semibold text-slate-900">
                          {formatCurrency(semester.totalCommission || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Paid</p>
                        <p className="text-xs font-semibold text-green-700">
                          {formatCurrency(semester.totalPaid || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {(semester.totalCommission || 0) >
                    (semester.totalPaid || 0) && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Outstanding</p>
                      <p className="text-xs font-semibold text-red-600">
                        {formatCurrency(
                          (semester.totalCommission || 0) -
                            (semester.totalPaid || 0)
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if no outstanding commission */}
        {/* {outstandingCommission <= 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              All eligible commissions have been paid. No action needed.
            </p>
          </div>
        )} */}

        {/* Action Buttons */}
        {/* <div className="flex gap-3 justify-end items-center pt-4 border-t border-slate-200">
          <ActionButton
            handleOpen={() => setIsOpen(false)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent={`Confirm & Process ${formatCurrency(
              outstandingCommission
            )}`}
            isPending={updateCheckStatusMutation.isPending}
            disabled={outstandingCommission <= 0}
          />
        </div> */}
      </div>
    </DialogWrapper>
  );
};

export default CheckStatusModal;

// "use client";
// import ActionButton from "@/components/common/button/actionButton";
// import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
// import { useState } from "react";
// import check from "/public/assets/icons/check_ring.svg";
// import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
// import { showToast } from "@/components/common/TostMessage/customTostMessage";
// import { useQueryClient } from "@tanstack/react-query";
// import { Info } from "lucide-react";

// /* eslint-disable @typescript-eslint/no-explicit-any */
// const CheckStatusModal = ({ data }: { data: any }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const queryClient = useQueryClient();

//   const updateCheckStatusMutation = useApiMutation({
//     method: "PATCH",
//     path: "courses/update",
//     onSuccess: (data) => {
//       showToast("success", data);
//       queryClient.invalidateQueries({
//         queryKey: ["fetch-degree-course-list"],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["fetch-diploma-course-list"],
//       });
//       setIsOpen(!open);
//     },
//     onError: (error: any) => {
//       showToast("error", error);
//       setIsOpen(!open);
//     },
//   });

//   //. Define a submit handler.
//   function onSubmit() {
//     console.log("Cheing id", data);

//     //    updateCheckStatusMutation.mutate(body);
//   }

//   return (
//     <DialogWrapper
//       open={isOpen}
//       handleOpen={() => setIsOpen(!isOpen)}
//       triggerContent={
//         <ActionButton
//           disabled={data?.status === "CHECKED"}
//           handleOpen={() => setIsOpen(!isOpen)}
//           imageSrc={check}
//           variant="icon"
//           tooltipContent="Check Status"
//         />
//       }
//       style="min-w-[400px]"
//     >
//       <div>
//         <div className="flex gap-x-3">
//           <Info />
//           <div className="font-semibold">
//             <h3>You’re about to mark {data?.name} as Paid</h3>
//             <p className="mt-2 text-xs">This cannot be undone.</p>
//           </div>
//         </div>

//         <div className="flex gap-x-3 justify-end items-center mt-4">
//           <ActionButton
//             handleOpen={() => setIsOpen(!isOpen)}
//             buttonContent="Cancel"
//             variant="outline"
//           />
//           <ActionButton
//             handleOpen={() => onSubmit()}
//             buttonContent="Confirm"
//             isPending={updateCheckStatusMutation.isPending}
//           />
//         </div>
//       </div>
//     </DialogWrapper>
//   );
// };

// export default CheckStatusModal;
