/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { Check, CheckCircle } from "lucide-react";

type CommissionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  commissionGroup: any;
};

export const CommissionViewModal = ({
  isOpen,
  onClose,
  commissionGroup,
}: CommissionDialogProps) => {
  const {user} = useAuths();
  const token = user?.token;

  console.log(commissionGroup, "Commission")

  // Function to check if a range matches the current commission range
  const isCurrentRange = (range: any) => {
    const current = commissionGroup?.commissionRange;
    if (!current) return false;
    
    return (
      range.studentRangeLower === current.studentRangeLower &&
      range.studentRangeUpper === current.studentRangeUpper &&
      range.firstRate === current.firstRate &&
      range.secondRate === current.secondRate &&
      range.thirdRate === current.thirdRate &&
      range.fourthRate === current.fourthRate
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 flex flex-col">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-xl font-semibold">
                  Commission Rate
                </DialogTitle>
              </DialogHeader>
        <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border rounded-md">
                  <thead>
                    <tr className="border-b">
                      <th className="w-10 py-3 px-4"></th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600" colSpan={2}>
                        Student Range
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600" colSpan={4}>
                        Commission Rate
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Bonus Amount
                      </th>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <th className="w-10 py-2 px-4"></th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">Lower Limit</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">Upper Limit</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">1st Year</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">2nd Year</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">3rd Year</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600">4th Year</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionGroup?.commissionRangeData?.map((range: any, index: number) => {
                      const isCurrent = isCurrentRange(range);
                      return (
                        <tr 
                          key={index} 
                          className={`border-b ${isCurrent ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-gray-50'}`}
                        >
                          <td className="w-10 py-3 px-4 text-center">
                            {isCurrent && (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-3 px-4 text-sm">
                            {range?.studentRangeLower}
                          </td>
                          <td className="text-center py-3 px-4 text-sm">
                            {range?.studentRangeUpper}
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-gray-600">
                            {range?.firstRate}%
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-gray-600">
                            {range?.secondRate}%
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-gray-600">
                            {range?.thirdRate}%
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-gray-600">
                            {range?.fourthRate}%
                          </td>
                          {index === 0 && (
                            <td className="text-center py-3 px-4 text-sm text-gray-600">
                              {commissionGroup?.bonus || "-"}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <ActionButton
                handleOpen={onClose}
                btnStyle="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                buttonContent="Cancel"
                variant="cancel"
              />
            </div>
      </DialogContent>
    </Dialog>
  );
};