import { useState, useEffect } from "react";
import { addDays,format as formatDate } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/utils/DateSelector";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuths } from "@/hooks/userContext";
import { downloadAuditLogs } from "../query_controller/downloadAuditLogs";

export function AuditDownloadModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [dateRangeType, setDateRangeType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const auth = useAuths();
  const token = auth?.user?.token;

  useEffect(() => {
    if (!open) {
      setDateRangeType("all");
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: downloadAuditLogs,
    onError: (error) => {
      toast.error("Failed to download audit logs.");
      console.error(error);
    },
    onSuccess: () => {
      setOpen(false);
    },
  });

  // const format = (date: Date) => date.toISOString().split("T")[0];
  const format = (date: Date) => formatDate(date, 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:min-w-[500px] sm:max-w-[600px] px-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Select Date Range
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <label className="block mb-2 text-sm text-gray-600 font-medium">
            Choose Range
          </label>
          <Select value={dateRangeType} onValueChange={setDateRangeType}>
            <SelectTrigger className="w-full h-10 border-gray-300 rounded-md text-sm">
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="dateRange">Date Range</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {dateRangeType === "dateRange" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Start Date
              </label>
              <DateSelector value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                End Date
              </label>
              <DateSelector value={endDate} onChange={setEndDate} />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="px-6 py-2 text-sm bg-[#013E5B] text-white hover:bg-[#015377]"
            onClick={() => {
              if (dateRangeType === "dateRange") {
                if (!startDate || !endDate) {
                  toast.error("Please select both start and end dates.");
                  return;
                }
                if (startDate > endDate) {
                  toast.error("Start date cannot be later than end date.");
                  return;
                }
                // console.log("Start Date, End Date", format(startDate), format(endDate));
                mutation.mutate({
                  filter: "dateRange",
                  startDate: format(startDate),
                  endDate: format(addDays(endDate, 1)),
                  token: token as string,
                });
              } else {
                mutation.mutate({ filter: dateRangeType, token: token as string, });
              }
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Downloading..." : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
