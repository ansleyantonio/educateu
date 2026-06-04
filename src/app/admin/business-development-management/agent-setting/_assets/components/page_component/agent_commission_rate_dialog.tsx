/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuths } from "@/hooks/userContext";
import { AxiosError } from "axios";
import { Plus, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createAgentCommissionRate } from "../../query_controller/createAgentCommissionRate";
import ActionButton from "@/components/common/button/actionButton";
import { z } from "zod";

type AgentCommissionRateProps = {
  isOpen: boolean;
  onClose: () => void;
  groupType: "internal" | "external";
  group: {
    commissionGroupId: string;
    assignedAgents?: boolean;
    commissionGroupName: string;
    bonus: number;
    studentLimit: number;
    commissions: {
      studentRangeLower: number;
      studentRangeUpper: number;
      rate1: number;
      rate2: number;
      rate3: number;
      rate4: number;
    }[];
  } | null;
  refetchGroups: () => void;
};

// Base row schema
const baseRowSchema = z.object({
  lower: z
    .string()
    .regex(/^\d*$/, "Must be a number"),
  upper: z
    .string()
    .regex(/^\d*$/, "Must be a number"),
  rate1: z.string().regex(/^\d*$/, "Must be a number").optional(),
  rate2: z.string().regex(/^\d*$/, "Must be a number").optional(),
  rate3: z.string().regex(/^\d*$/, "Must be a number").optional(),
  rate4: z.string().regex(/^\d*$/, "Must be a number").optional(),
});

export const AgentCommissionRateDialog = ({
  isOpen,
  onClose,
  groupType,
  group,
  refetchGroups,
}: AgentCommissionRateProps) => {
  const { user, editAccess } = useAuths();
  const token = user?.token;

  const [commissionBonus, setCommissionBonus] = useState(0);
  const [studentLimit, setStudentLimit] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [rows, setRows] = useState([
    { upper: "", lower: "1", rate1: "", rate2: "", rate3: "", rate4: "" },
  ]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    if (group) {
      setCommissionBonus(group.bonus ?? 0);
      setStudentLimit(group.studentLimit ?? 0);

      if (group.commissions?.length) {
        setRows(
          group.commissions.map((c, idx) => ({
            lower: c.studentRangeLower.toString(),
            upper: c.studentRangeUpper.toString(),
            rate1: c.rate1?.toString() ?? "",
            rate2: c.rate2?.toString() ?? "",
            rate3: c.rate3?.toString() ?? "",
            rate4: c.rate4?.toString() ?? "",
          }))
        );
      } else {
        setRows([{ upper: "", lower: "1", rate1: "", rate2: "", rate3: "", rate4: "" }]);
      }
    } else {
      setCommissionBonus(0);
      setStudentLimit(0);
      setRows([{ upper: "", lower: "1", rate1: "", rate2: "", rate3: "", rate4: "" }]);
    }
  }, [group]);

  // Check if the last row has an upper value and it's greater than lower
  const canAddRow = () => {
    if (rows.length === 0) return false;
    const lastRow = rows[rows.length - 1];
    const upper = lastRow.upper.trim();
    const lower = lastRow.lower.trim();
    
    // Check if upper value exists and is a valid number
    if (!upper || !lower) return false;
    
    const upperNum = Number(upper);
    const lowerNum = Number(lower);
    
    // Check if both are valid numbers and upper is greater than lower
    return !isNaN(upperNum) && !isNaN(lowerNum) && upperNum > lowerNum;
  };

  // Validate all rows with cross-row logic
  const validateRows = (rowsToValidate: typeof rows) => {
    const newErrors: Record<number, Record<string, string>> = {};
    let hasError = false;

    rowsToValidate.forEach((row, idx) => {
      const validation = baseRowSchema.safeParse(row);
      if (!validation.success) {
        newErrors[idx] = Object.fromEntries(
          Object.entries(validation.error.flatten().fieldErrors).map(([k, v]) => [
            k,
            v?.[0] || "",
          ])
        );
        hasError = true;
      } else {
        newErrors[idx] = {};
      }

      // Custom cross-row validation
      const lower = Number(row.lower);
      const upper = Number(row.upper);
      if (idx === 0 && lower !== 1) {
        newErrors[idx].lower = "First lower value must start at 1";
        hasError = true;
      }
      if (upper < lower) {
        newErrors[idx].upper = "Upper must be greater than Lower";
        hasError = true;
      }
      if (idx > 0) {
        const prevUpper = Number(rowsToValidate[idx - 1].upper);
        if (lower !== prevUpper + 1) {
          newErrors[idx].lower = `Must start at ${prevUpper + 1}`;
          hasError = true;
        }
      }
    });

    return { newErrors, hasError };
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...rows];
    updated[index][field as keyof (typeof updated)[0]] = value;
    setRows(updated);

    const { newErrors } = validateRows(updated);
    setErrors(newErrors);
  };

  const handleUpdate = async () => {
    setIsPending(true);
    setApiError(null);

    if (!group?.commissionGroupId || !token) {
      setApiError("Missing commission group ID or token");
      setIsPending(false);
      return;
    }

    const { newErrors, hasError } = validateRows(rows);
    if (hasError) {
      setErrors(newErrors);
      setIsPending(false);
      return;
    }

    try {
      await createAgentCommissionRate({
        token,
        commissionGroupId: group.commissionGroupId,
        bonus: commissionBonus,
        studentLimit: studentLimit,
        commissions: rows.map((row) => ({
          studentRangeLower: Number(row.lower),
          studentRangeUpper: Number(row.upper),
          rate1: row.rate1 ? Number(row.rate1) : 0,
          rate2: row.rate2 ? Number(row.rate2) : 0,
          rate3: row.rate3 ? Number(row.rate3) : 0,
          rate4: row.rate4 ? Number(row.rate4) : 0,
        })),
      });

      setErrors({});
      setIsPending(false);
      refetchGroups();
      toast.success("Successfully Added Commission");
      onClose();
    } catch (error) {
      const err = error as AxiosError;
      setApiError(err?.message || "An unexpected error occurred");

      // auto-clear error after 5s
      setTimeout(() => setApiError(null), 5000);

      setIsPending(false);
    }
  };

  const addRow = () => {
    const lastUpper = Number(rows[rows.length - 1].upper || 0);
    const newLower = lastUpper ? lastUpper + 1 : 1;
    setRows([
      ...rows,
      { upper: "", lower: newLower.toString(), rate1: "", rate2: "", rate3: "", rate4: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
    setConfirmDeleteIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {groupType === "internal"
              ? `Internal Agent Commission Rate - ${group?.commissionGroupName}`
              : `External Agent Commission Rate - ${group?.commissionGroupName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
          <Table className="table-auto bg-white">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead colSpan={2} className="text-center border-r border-gray-200">
                  Student Range
                </TableHead>
                <TableHead colSpan={4} className="text-center border-r border-gray-200">
                  Commission Rate
                </TableHead>
                <TableHead className="text-center border-r border-gray-200">Bonus</TableHead>
                <TableHead className="text-center border-r border-gray-200">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row, index) => {
                const disableRow =
                  group?.assignedAgents && index < (group?.commissions?.length || 0);

                return (
                  <TableRow key={index}>
                    {["lower", "upper", "rate1", "rate2", "rate3", "rate4"].map((field) => (
                      <TableCell key={field} className="text-center border-r border-gray-200">
                        <Input
                          value={row[field as keyof typeof row]}
                          disabled={disableRow || field === "lower"} // lock lower to prevent breaking auto logic
                          onChange={(e) => handleChange(index, field, e.target.value)}
                          className="text-center"
                          placeholder="0"
                        />
                        {errors[index]?.[field] && (
                          <p className="text-xs text-red-500 mt-1">{errors[index][field]}</p>
                        )}
                      </TableCell>
                    ))}

                    {index === 0 && (
                      <TableCell rowSpan={rows.length} className="text-center border-r border-gray-200">
                        {commissionBonus > 0
                          ? `Bonus €${commissionBonus} when student is enrolled over ${studentLimit}`
                          : "No bonus available"}
                      </TableCell>
                    )}

                    <TableCell className="text-center">
                      {confirmDeleteIndex === index ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="icon"
                            onClick={() => removeRow(index)}
                            className="bg-transparent text-green-500"
                          >
                            <Check size={12} />
                          </Button>
                          <Button
                            size="icon"
                            onClick={() => setConfirmDeleteIndex(null)}
                            className="text-red-500 bg-transparent"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setConfirmDeleteIndex(index)}
                          disabled={disableRow}
                          className="group bg-[#F9FAFB] hover:bg-[#F9FAFB] hover:text-red-700"
                        >
                          <Trash2 size={16} className="text-black group-hover:text-red-700" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {(apiError || Object.keys(errors).some((i) => Object.keys(errors[Number(i)]).length)) && (
            <div className="p-3 mt-3 text-red-500 text-sm">
              <div className="flex gap-2 items-center">
                <AlertCircle className="text-red-500" />
                <div>
                  {apiError || "Please fix the highlighted errors above before submitting."}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="p-4 mt-8">
              <Button
                className="flex items-center justify-center w-8 h-8 bg-[#013E5B] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={addRow}
                disabled={group?.assignedAgents || !canAddRow()}
              >
                <Plus size={16} />
              </Button>
            </div>
            {!group?.assignedAgents && (
              <div className="flex items-center gap-4 p-4">
                <div>
                  <label className="font-medium text-xs">Commission Bonus:</label>
                  <Input
                    value={commissionBonus}
                    disabled={!editAccess}
                    onChange={(e) => setCommissionBonus(Number(e.target.value))}
                    className="text-center"
                    placeholder="e.g: €100"
                  />
                </div>
                <div>
                  <label className="text-xs">Bonus Student Limit:</label>
                  <Input
                    value={studentLimit}
                    disabled={!editAccess}
                    onChange={(e) => setStudentLimit(Number(e.target.value))}
                    className="text-center"
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            className="border border-[#CFD6DD] text-[#4A545E] bg-white rounded-md px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </Button>
          <ActionButton
            btnStyle="bg-[#013E5B] text-white px-4 py-2 rounded-md text-sm"
            handleOpen={handleUpdate}
            disabled={group?.assignedAgents}
            loadingContent="Updating..."
            buttonContent="Update"
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};