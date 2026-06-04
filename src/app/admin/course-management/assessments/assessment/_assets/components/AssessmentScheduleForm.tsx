"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Assessment, CreateAssessmentValues } from "../utils/types";
import { DatePickerWithConstraints } from "./DatePickerWithConstraints";


export default function AssessmentScheduleForm({
    form,
    setActiveTab,
    isSubmitting,
    isEditMode,
}: {
    form: UseFormReturn<CreateAssessmentValues | Assessment>;
    setActiveTab: Dispatch<SetStateAction<string>>;
    isSubmitting?: boolean;
    isEditMode?: boolean;
}) {
    const lateSubmissions = form.watch("lateSubmissions");
    const timeType = form.watch("timeType") ?? "minutes";
    const availableStartDateRaw = form.watch("availableStartDate");
    const availableEndDateRaw = form.watch("availableEndDate");
    const dueDateRaw = form.watch("dueDate");

    // Convert string dates to Date objects if needed
    const availableStartDate = availableStartDateRaw
        ? typeof availableStartDateRaw === "string"
            ? new Date(availableStartDateRaw)
            : availableStartDateRaw
        : null;
    const availableEndDate = useMemo(() => {
        return availableEndDateRaw
            ? typeof availableEndDateRaw === "string"
                ? new Date(availableEndDateRaw)
                : availableEndDateRaw
            : null;
    }, [availableEndDateRaw]);
    const dueDate = useMemo(() => {
        return dueDateRaw
            ? typeof dueDateRaw === "string"
                ? new Date(dueDateRaw)
                : dueDateRaw
            : null;
    }, [dueDateRaw]);

    // Set due date to end date when end date is selected and late submissions is enabled
    useEffect(() => {
        if (availableEndDate && lateSubmissions) {
            // Only set if due date is not already set or if it's different from end date
            if (!dueDateRaw || (dueDate && dueDate.getTime() !== availableEndDate.getTime())) {
                form.setValue("dueDate", availableEndDate, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            }
        }
    }, [availableEndDate, lateSubmissions, form, dueDate, dueDateRaw]);

    return (
        <React.Fragment>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <DatePickerWithConstraints
                        form={form}
                        name="availableStartDate"
                        labelName="Available Start Date"
                        optional={false}
                        placeholder="Pick a start date"
                        maxDate={dueDate || availableEndDate || null}
                    />
                    <DatePickerWithConstraints
                        form={form}
                        name="availableEndDate"
                        labelName="Available End Date"
                        optional={false}
                        placeholder="Pick an end date"
                        minDate={availableStartDate || null}
                    />
                </div>



                <div className="grid grid-cols-2 gap-4">
                    <CustomField.Number
                        form={form}
                        name="timeLimit"
                        labelName={`Time Limit (${timeType === "hours" ? "hours" : "minutes"})`}
                        optional={false}
                        placeholder="Enter time limit"
                        numberType="integer"
                    />
                    <CustomField.SelectField
                        form={form}
                        name="timeType"
                        labelName="Time Unit"
                        optional={false}
                        placeholder="Select unit"
                        options={[
                            { label: "Minutes", value: "minutes" },
                            { label: "Hours", value: "hours" },
                        ]}
                    />
                </div>


                <div className="grid grid-cols-2 gap-4">
                    <CustomField.Number
                        form={form}
                        name="totalPointsOrWeight"
                        labelName="Total Points/Weight"
                        optional={false}
                        placeholder="Enter total points/weight"
                        numberType="float"
                    />
                    <CustomField.Number
                        form={form}
                        name="passingScore"
                        labelName="Passing Score"
                        optional={true}
                        placeholder="Enter passing score"
                        numberType="float"
                    />
                </div>

                <CustomField.Number
                    form={form}
                    name="attempts"
                    labelName="Attempts Allowed"
                    optional={false}
                    placeholder="Enter attempts allowed"
                    numberType="integer"
                />

                <CustomField.SwitchField
                    form={form}
                    name="lateSubmissions"
                    labelName="Late Submissions"
                    optional={true}
                    placeholder=""
                />

                {lateSubmissions && (
                    <DatePickerWithConstraints
                        form={form}
                        name="dueDate"
                        labelName="Due Date"
                        optional={true}
                        placeholder="Pick a due date (optional)"
                        minDate={availableStartDate || null}
                        maxDate={availableEndDate || null}
                    />
                )}
            </div>
            <FormAction setActiveTab={setActiveTab} isSubmitting={isSubmitting} isEditMode={isEditMode} />
        </React.Fragment>
    );
}

function FormAction({
    setActiveTab,
    isSubmitting,
    isEditMode
}: {
    setActiveTab: Dispatch<SetStateAction<string>>;
    isSubmitting?: boolean;
    isEditMode?: boolean;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("details")}
                disabled={isSubmitting}
            >
                Back
            </Button>
            <Button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                    </>
                ) : (
                    isEditMode ? "Update" : "Create"
                )}
            </Button>
        </div>
    )

}