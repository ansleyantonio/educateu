/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultiViewSelector from "@/utils/MultiViewSelector";
import {
  bookingInterview,
  fetchAssignedInterview,
} from "../query_controller/bookingInterview";
import { useMutation, useQuery } from "@tanstack/react-query";
//import DatePickerComponent from "@/utils/datePicker";
import TimePickerComponent from "@/utils/timePicker";
import { InterviewerSearchField } from "@/components/common/search/interview/searchInterviewer";
import { useParams } from "next/navigation";
import { CustomField } from "@/components/common/fields/cusInputField";
import dateFormat from "@/utils/DateFormatter";

// Zod Schema & Types
const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    interviewDate: z.date(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    platform: z.string(),
    guests: z.array(z.string().email()).optional(),
    interviewerId: z.string().min(1, "Interviewer is required"),
    color: z.string(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type FormValues = z.infer<typeof formSchema>;

interface BookInterviewProps {
  selectedDate?: Date;
  isOpen: boolean;
  setIsBookingOpen: (isOpen: boolean) => void;
}

const options = [
  {
    label: "China@gmail.com",
    value: "china@gmail.com",
    image: "https://flagcdn.com/w40/cn.png",
  },
  {
    label: "UNmm",
    value: "usa@gmail.com",
    image: "",
  },
  {
    label: "Japan@gmail.com",
    value: "japan@gmail.com",
    image: "https://flagcdn.com/w40/jp.png",
  },
  {
    label: "Korea@gmail.com",
    value: "korea@gmail.com",
    image: "https://flagcdn.com/w40/kr.png",
  },
];

const BookInterview: React.FC<BookInterviewProps> = ({
  selectedDate,
  isOpen,
  setIsBookingOpen,
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const params = useParams();
  const applicationId = params?.slug as string;
  const [searchText, setSearchText] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      interviewDate: selectedDate || new Date(),
      startTime: "",
      endTime: "",
      platform: "Google Meet",
      guests: [],
      interviewerId: "",
      color: "#9786FF",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-assigned-interview", token, searchText],
    queryFn: fetchAssignedInterview,
    enabled: !!token && !!searchText,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const interviewMutation = useMutation({
    mutationFn: (newData: any) => bookingInterview(newData),
    onSuccess: (data) => {
      setIsBookingOpen(false);
      reset();
      toast.success(data?.message);
    },
    onError: (error) => {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book interview");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) return toast.error("No authentication token found");

    const interviewData = {
      ...data,
      interviewDate: dateFormat.localToISO(data.interviewDate),
      startTime: dateFormat.toISOFromTime(data.interviewDate, data.startTime),
      endTime: dateFormat.toISOFromTime(data.interviewDate, data.endTime),
    };

    const newData = {
      token,
      id: applicationId,
      body: interviewData,
    };

    interviewMutation.mutateAsync(newData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsBookingOpen}>
      <DialogContent className="overflow-y-auto p-6 max-h-[80vh]">
        <DialogHeader className="hidden">
          <DialogTitle>Book Interview</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center">
          <Calendar className="w-6 h-6 text-gray-600" />
          <div>
            <h2 className="text-lg font-semibold">Book Interview</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to schedule a new interview.
            </p>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Interview Title
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. Frontend Developer Interview"
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <CustomField.DatePickerAnd
              form={form}
              name="interviewDate"
              labelName="Interview Date"
              placeholder="Select date"
            />

            <div className="grid grid-cols-2 gap-2 mt-2">
              <TimePickerComponent
                form={form}
                name="startTime"
                label="Start Time"
              />
              <TimePickerComponent
                form={form}
                name="endTime"
                label="End Time"
              />
            </div>

            <CustomField.SelectField
              form={form}
              name="platform"
              labelName="Platform"
              placeholder="Select platform"
              options={[
                { label: "Google Meet", value: "Google Meet" },
                { label: "Zoom", value: "Zoom" },
                { label: "Microsoft Teams", value: "Microsoft Teams" },
              ]}
            />

            <MultiViewSelector
              name="guests"
              label="Guest Email"
              form={form}
              options={options}
              isImage={true}
            />

            <InterviewerSearchField
              form={form}
              name="interviewerId"
              label="Assign Interviewer"
              searchText={searchText}
              setSearchText={setSearchText}
              users={data?.data?.formattedInterviewers || []}
              isLoading={isLoading}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={interviewMutation.isPending}>
                {interviewMutation.isPending ? "Booking..." : "Continue"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default BookInterview;
