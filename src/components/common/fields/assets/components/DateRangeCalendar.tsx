/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from "react";
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface DatePickerProps {
  form: UseFormReturn<any, any>;
  name: string;
  labelName: string;
  isDisabled?: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

const DateRangeCalendar = ({
  form,
  name,
  labelName,
  isDisabled = false,
  previousDisabled = false,
  nextDisabled = false,
}: DatePickerProps) => {
  const disabledDate = (date: dayjs.Dayjs) =>
    previousDisabled
      ? date.isBefore(dayjs(), "day")
      : nextDisabled
        ? date.isAfter(dayjs(), "day")
        : false;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{labelName}</FormLabel>
          <FormControl>
            <AntDatePicker
              {...field}
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) =>
                form.setValue(name, date ? dayjs(date).toDate() : null)
              }
              className="w-full"
              format="YYYY-MM-DD"
              disabled={isDisabled}
              disabledDate={disabledDate}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateRangeCalendar;
