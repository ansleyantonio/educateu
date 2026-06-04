/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { TimePicker } from "antd";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import dayjs from "dayjs";

interface TimePickerProps {
  form: UseFormReturn<any, any>;
  name: string;
  label: string;
  dependencies?: Date | string | null;
}

const TimePickerComponent = ({
  name,
  form,
  label,
  dependencies,
}: TimePickerProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Convert the field value (Date object) to dayjs for the TimePicker
        const fieldValue = field.value ? dayjs(field.value) : null;

        // Get the base date (either from dependencies or current field value or new Date())
        const baseDate = dependencies
          ? dayjs(dependencies)
          : fieldValue || dayjs();

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <TimePicker
                format="hh:mm a"
                use12Hours
                className="w-full"
                value={fieldValue}
                onChange={(time) => {
                  if (time) {
                    // Combine the base date with the new time
                    const newDateTime = baseDate
                      .hour(time.hour())
                      .minute(time.minute())
                      .second(0)
                      .millisecond(0)
                      .toDate();

                    form.setValue(name, newDateTime);
                  } else {
                    form.setValue(name, null);
                  }
                }}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default TimePickerComponent;
