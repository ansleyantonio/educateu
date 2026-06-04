/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";

// Define component props
interface InvoiceGenerateProps {
  data: any[];
  selectedIds: string[];
  selectObject: any[];
  setOpen: (open: boolean) => void;
}

interface InputState {
  [key: string]: {
    value: string;
    error: string | null;
  };
}

const InvoiceGeneration: React.FC<InvoiceGenerateProps> = ({
  setOpen,
  data,
  selectedIds,
  selectObject,
}) => {
  const queryClient = useQueryClient();

  // Checkbox states
  const [isSelectedIds, setIsSelectedIds] = useState<string[]>([
    ...selectedIds,
  ]);
  const [isSelectedObjects, setIsSelectedObjects] = useState<any[]>([
    ...selectObject,
  ]);
  const [inputState, setInputState] = useState<InputState>({});

  const validatePayoutAmount = (
    id: string,
    value: string,
    potentialPayout: number
  ): { isValid: boolean; error: string | null; safeValue: number } => {
    if (value === "" || value === undefined) {
      return { isValid: true, error: null, safeValue: 0 };
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: "Please enter a valid number",
        safeValue: 0,
      };
    }

    if (numValue < 0) {
      return {
        isValid: false,
        error: "Amount cannot be negative",
        safeValue: 0,
      };
    }

    if (numValue > potentialPayout) {
      return {
        isValid: false,
        error: `Amount exceeds potential payout of ${potentialPayout}`,
        safeValue: potentialPayout,
      };
    }

    return { isValid: true, error: null, safeValue: numValue };
  };

  // Handle invoice amount input change with real-time validation
  const handleInvoiceAmountChange = (id: string, value: string) => {
    const student = data.find((s) => s.id === id);
    if (!student) return;

    // Allow empty input
    if (value === "") {
      setInputState((prev) => ({
        ...prev,
        [id]: {
          value: "",
          error: null,
        },
      }));
      return;
    }

    const numValue = Number(value);

    // Reject if not a valid number
    if (isNaN(numValue)) {
      return;
    }

    // Reject if negative
    if (numValue < 0) {
      setInputState((prev) => ({
        ...prev,
        [id]: {
          value: "",
          error: "Amount cannot be negative",
        },
      }));
      return;
    }

    if (numValue > student.potentialPayout) {
      setInputState((prev) => ({
        ...prev,
        [id]: {
          value: student.potentialPayout.toString(),
          error: `Cannot exceed potential payout of ${student.potentialPayout}`,
        },
      }));
      return;
    }

    // Valid input - allow it
    setInputState((prev) => ({
      ...prev,
      [id]: {
        value,
        error: null,
      },
    }));
  };

  const handleInputBlur = (student: any, value: string) => {
    const validation = validatePayoutAmount(
      student.id,
      value,
      student.potentialPayout
    );

    // Update input state with validation result
    setInputState((prev) => ({
      ...prev,
      [student.id]: {
        value: validation.safeValue.toString(),
        error: validation.error,
      },
    }));

    // Update selected objects with validated value
    setIsSelectedObjects((prev: any[]) =>
      prev.map((item) =>
        item.id === student.id
          ? { ...item, requestedPayout: validation.safeValue }
          : item
      )
    );
  };

  const generateInvoice = useApiMutation({
    path: `commissions/bulk-generate`,
    safe: false,
    method: "POST",
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`fetch-commission-data`],
      });
      setOpen(false);

      showToast("success", data);
    },
  });

  const onSubmitInvoice = (data: any[]) => {
    const simplified = data.map((item) => ({
      applicationId: item.applicationId,
      requestedPayout: Number(item.requestedPayout),
    }));

    generateInvoice.mutate(simplified);
    console.log("Invoice Generation", simplified);
  };

  return (
    <div className="space-y-4">
      <DynamicTableWithPagination
        data={data}
        isLoading={false}
        currentPage={1}
        setCurrentPage={() => {}}
        config={{
          columns: [
            {
              key: "fullName",
              header: "Name",
              render: (row: any) => (
                <p className="font-medium">{row.fullName}</p>
              ),
            },
            {
              key: "applicantId",
              header: "Student ID",
              render: (row: any) => (
                <p className="font-medium">{row.applicantId}</p>
              ),
            },
            {
              key: "potentialPayout",
              header: "Potential Payout",
              render: (row: any) => (
                <p className="font-medium">{row.potentialPayout}</p>
              ),
            },
            {
              key: "requestedPayout",
              header: "Requested Payout",
              render: (student: any) => {
                const state = inputState[student.id] || {
                  value: student.requestedPayout || "",
                  error: null,
                };
                const hasError = state.error !== null;

                return (
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="Enter invoice amount"
                      value={state.value}
                      min={0}
                      max={student.potentialPayout}
                      className={`h-8 px-3 w-full text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors ${
                        hasError
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-green-500 focus:ring-green-500 focus:border-green-500"
                      }`}
                      onChange={(e) =>
                        handleInvoiceAmountChange(student.id, e.target.value)
                      }
                      onBlur={(e) => handleInputBlur(student, e.target.value)}
                    />
                    {hasError && (
                      <p className="text-xs font-medium text-red-600">
                        {state.error}
                      </p>
                    )}
                    {!hasError && state.value && (
                      <p className="text-xs font-medium text-green-600">
                        Valid amount
                      </p>
                    )}
                  </div>
                );
              },
            },
          ],
        }}
        isCheckBox={true}
        selectedIds={isSelectedIds}
        setSelectedIds={setIsSelectedIds}
        setSelectObject={setIsSelectedObjects}
      />
      <div className="flex gap-x-4 justify-end items-center mt-6">
        <ActionButton variant="outline" buttonContent="Cancel" />

        <ActionButton
          variant="primary"
          disabled={isSelectedObjects?.length === 0}
          isPending={generateInvoice.isPending}
          buttonContent="Generate Invoice"
          btnStyle="text-white"
          handleOpen={() => onSubmitInvoice(isSelectedObjects)}
        />
      </div>
    </div>
  );
};

export default InvoiceGeneration;
