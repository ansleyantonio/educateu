"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { DatePicker as AntDatePicker, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Path, PathValue, UseFormReturn } from "react-hook-form";
import { Assessment, CreateAssessmentValues } from "../utils/types";

type FormValues = CreateAssessmentValues | Assessment;

interface DatePickerWithConstraintsProps {
    form: UseFormReturn<FormValues>;
    name: Path<FormValues>;
    labelName: string;
    optional?: boolean;
    placeholder?: string;
    minDate?: Date | null | undefined;
    maxDate?: Date | null | undefined;
}

export const DatePickerWithConstraints = ({
    form,
    name,
    labelName,
    optional = false,
    placeholder,
    minDate,
    maxDate,
}: DatePickerWithConstraintsProps) => {
    const getDisabledDate = (current: Dayjs) => {
        // Allow same day, but disable dates before minDate
        if (minDate && current.isBefore(dayjs(minDate).startOf("day"))) {
            return true;
        }
        // Allow same day, but disable dates after maxDate
        if (maxDate && current.isAfter(dayjs(maxDate).endOf("day"))) {
            return true;
        }
        return false;
    };

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => {
                const error = form.formState.errors?.[name as keyof FormValues];
                const isError = !!error;
                const fieldValue = field.value as Date | string | undefined;
                return (
                    <FormItem>
                        {labelName && (
                            <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                                {TextCaseFormat(labelName)}
                                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
                            </label>
                        )}
                        <FormControl>
                            <div className="!w-full">
                                <Space direction="vertical" className="w-full">
                                    <AntDatePicker
                                        picker="date"
                                        placeholder={TextCaseFormat(placeholder || "Select Date")}
                                        className="w-full min-h-[40px]"
                                        value={fieldValue ? dayjs(fieldValue) : undefined}
                                        onChange={(date) => {
                                            if (!date) {
                                                form.setValue(name, undefined as PathValue<FormValues, typeof name>, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                                return;
                                            }
                                            form.setValue(name, date.toDate() as PathValue<FormValues, typeof name>, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                        }}
                                        format="YYYY-MM-DD"
                                        disabledDate={getDisabledDate}
                                    />
                                </Space>
                            </div>
                        </FormControl>
                        <FormMessage>
                            {isError ? String(error?.message || "") : ""}
                        </FormMessage>
                    </FormItem>
                );
            }}
        />
    );
};

