/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { InterviewerSearchField } from "@/components/common/search/interview/searchInterviewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiViewSelector from "@/utils/MultiViewSelector";
import TimePickerComponent from "@/utils/timePicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { CustomField } from "../../fields/cusInputField";
import { showToast } from "../../TostMessage/customTostMessage";
import { DialogWrapper } from "../common_dialog/common_dialog";
// import ActionButton from "../../button/actionButton";
import dateFormat from "@/utils/DateFormatter";

// Zod Schema & Types
const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    interviewDate: z.date(),
    startTime: z.date(),
    endTime: z.date(),
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
  applicationId?: string;
  applicationInfo?: any;
  selectedDate?: Date;
  isBookingOpen: boolean;
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
  applicationId,
  applicationInfo,
  selectedDate,
  isBookingOpen,
  setIsBookingOpen,
}) => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      interviewDate: selectedDate || new Date(),
      startTime: undefined,
      endTime: undefined,
      platform: "Google Meet",
      guests: [],
      interviewerId: "",
      color: "#9786FF",
    },
  });

  const { data, isLoading } = useFetchData({
    queryKey: "fetch-assigned-interview",
    path: `interview/interviewer/search`,
    method: "GET",
    filterData: {
      term: searchText,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const interviewMutation = useApiMutation({
    method: "POST",
    path: `interview/applications/${applicationInfo?.id ?? applicationId}`,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interview-calendar"] });
      queryClient.invalidateQueries({
        queryKey: ["interview-able-applicants"],
      });
      setIsBookingOpen(false);
      reset();
      showToast("success", data);
    },
  });

  const onSubmit = (data: FormValues) => {
    const interviewData = {
      ...data,
      startTime: dateFormat.localToISO(data.startTime),
      endTime: dateFormat.localToISO(data.endTime),
      interviewDate: dateFormat.localToISO(data.interviewDate),
    };
    interviewMutation.mutateAsync(interviewData);
  };

  return (
    <DialogWrapper
      open={isBookingOpen}
      handleOpen={() => setIsBookingOpen(!isBookingOpen)}
      title={
        <div className="flex gap-3 items-center">
          <Calendar className="w-6 h-6 text-gray-600" />
          <div>
            <h2 className="text-lg font-semibold">Book Interview</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to schedule a new interview.
            </p>
          </div>
        </div>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {applicationInfo && (
            <p className="font-semibold text-muted-foreground">
              Interviewee:{" "}
              {applicationInfo?.personalInformation?.firstName +
                " " +
                applicationInfo?.personalInformation?.lastName}
            </p>
          )}

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
              dependencies={form.watch("interviewDate")}
            />
            <TimePickerComponent
              form={form}
              name="endTime"
              label="End Time"
              dependencies={form.watch("interviewDate")}
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
            <Button
              type="submit"
              variant="primary"
              disabled={interviewMutation.isPending}
            >
              {interviewMutation.isPending ? "Booking..." : "Book Interview"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </DialogWrapper>
  );
};

export default BookInterview;
