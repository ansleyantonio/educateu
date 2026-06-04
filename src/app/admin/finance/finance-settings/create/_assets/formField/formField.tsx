"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import type { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { TabButton } from "@/components/ui/TabButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IFinanceSettingsForm } from "../schemas/financeSettingsSchema";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { CourseDetailsModalButton } from "@/app/admin/finance/_assets/components/modal/ViewCourseDetails";

interface FormType {
  form: UseFormReturn<IFinanceSettingsForm>;
  isEditMode?: boolean;
}

const Form_field = ({ form, isEditMode }: FormType) => {
  const [autoReminder, setAutoReminder] = useState(false);
  const [isValue, setIsValue] = useState("email");
  const [searchTerms, setSearchTerms] = useState({
    session: "",
    course: "",
  });

  const selectedSessionId = form.watch("sessionId");
  const courseId = form.watch("courseId");

  // Sync autoReminder state with form
  useEffect(() => {
    form.setValue("autoReminder", autoReminder);
  }, [autoReminder, form]);

  // select session
  const { options: sessionOptions, isLoading: sessionLoading } =
    DataFetcher.fetchAcademicSessions({
      filter: {
        search: searchTerms.session,
        status: ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"],
        pageSize: 50,
      },
    });

  // ensure selected session is always included
  const { options: selectedSessionOption } = DataFetcher.fetchAcademicSessions({
    filter: selectedSessionId
      ? {
          search: selectedSessionId,
          status: ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"],
          pageSize: 1,
        }
      : { pageSize: 0 },
    enabled: !!selectedSessionId,
  });

  const finalSessionOptions = [
    ...(sessionOptions || []),
    ...(selectedSessionOption || []),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((s) => s.value === item.value)
  );

  // select course
  const { options: courseOptions, isLoading: courseLoading } =
    DataFetcher.fetchCoursesBySessionId({
      sessionId: selectedSessionId ?? "",
      filter: {
        searchTerm: searchTerms.course ? searchTerms.course : courseId,
        pageSize: 100,
      },
    });

  const { options: selectedCourseOption } =
    DataFetcher.fetchCoursesBySessionId({
      sessionId: selectedSessionId ?? "",
      filter: courseId
        ? {
            searchTerm: courseId,
            pageSize: 1,
          }
        : { pageSize: 0 },
      enabled: !!selectedSessionId,
    });

  const finalCourseOptions = [
    ...(courseOptions || []),
    ...(selectedCourseOption || []),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((s) => s.value === item.value)
  );

  return (
    <div className="space-y-8 max-w-5xl overflow-y-hidden">
      {/* Discount Section */}
      <div className="space-y-4 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">Discount</h2>

        <CustomField.Text
          form={form}
          name="discountName"
          labelName="Discount Name"
          optional={false}
          viewOnly={isEditMode}
          placeholder="Enter discount name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomField.SelectField
            form={form}
            name="discountType"
            labelName="Discount Type"
            optional={false}
            viewOnly={isEditMode}
            placeholder="Select Discount Type"
            options={[
              { label: "Percentage", value: "PERCENTAGE" },
              { label: "Fixed Amount", value: "FIXED_AMOUNT" },
            ]}
          />

          <CustomField.Number
            form={form}
            name="discountValue"
            labelName="Discount Value"
            optional={false}
            viewOnly={isEditMode}
            placeholder="30.00"
          />
        </div>
      </div>

      {/* Templates Section */}
      <div className="space-y-4 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        <div className="w-full max-w-[100vw]">
          <Card className="pt-4 rounded shadow-sm border border-gray-200 mt-4 p-4">
            <Tabs value={isValue} onValueChange={setIsValue}>
              <TabsList className="w-full bg-white py-4 grid grid-cols-4 items-center justify-start mb-4">
                <TabButton
                  value="email"
                  label="Email Templates"
                  onClick={setIsValue}
                />
                <TabButton
                  value="payment"
                  label="Payment Request Templates"
                  onClick={setIsValue}
                />
                <TabButton
                  value="reminder"
                  label="Reminder Templates"
                  onClick={setIsValue}
                />
                <TabButton
                  value="invoice"
                  label="Invoice Templates"
                  onClick={setIsValue}
                />
              </TabsList>
              <ScrollArea className="pb-8">
                {["email", "payment", "reminder", "invoice"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4 py-2 mt-5">
                    <CustomField.Text
                      form={form}
                      name={`subject${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof IFinanceSettingsForm}
                      labelName="Subject Line"
                      optional
                      viewOnly={isEditMode}
                      placeholder={`Enter ${tab} template subject`}
                    />

                    <CustomField.RichTextEditor
                      form={form}
                      name={`template${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof IFinanceSettingsForm}
                      labelName="Template Content"
                      optional
                      placeholder="Enter template content"
                    />
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="space-y-4 border border-gray-200 p-4 bg-white rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {autoReminder ? "Enabled" : "Disabled"}
            </span>
            <Switch checked={autoReminder} onCheckedChange={setAutoReminder} />
          </div>
        </div>

        {autoReminder && (
          <CustomField.SelectField
            form={form}
            name="frequency"
            labelName="Set Frequency"
            optional
            placeholder="Select Frequency"
            options={[
              { label: "One Time", value: "ONCE" },
              { label: "Daily", value: "DAILY" },
              { label: "Weekly", value: "WEEKLY" },
              { label: "Monthly", value: "MONTHLY" },
            ]}
          />
        )}
      </div>

      {/* Filters Section */}
      <div className="space-y-4 border border-gray-200 p-4 bg-white rounded-md">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

        <CustomField.SelectField
          form={form}
          name="sessionId"
          placeholder="Select Session"
          labelName="Session"
          options={finalSessionOptions}
          onSearch={(value) =>
            setSearchTerms((prev) => ({ ...prev, session: value }))
          }
          isLoading={sessionLoading}
        />
        <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <CustomField.SelectField
          form={form}
          name="courseId"
          placeholder="Select Course"
          labelName="Course"
          onSearch={(value) =>
            setSearchTerms((prev) => ({ ...prev, course: value }))
          }
          isLoading={courseLoading}
          options={finalCourseOptions}
        />
                  </div>
                  {/* View Course Details Button */}
                  {courseId && (
                    <CourseDetailsModalButton courseId={courseId} />
                  )}
                </div>

        <CustomField.SelectField
          form={form}
          name="paymentStatus"
          labelName="Payment Status"
          placeholder="Select Payment Status"
          options={[
            { label: "Completed", value: "COMPLETED" },
            { label: "Pending", value: "PENDING" },
            { label: "Failed", value: "FAILED" },
          ]}
        />
      </div>
    </div>
  );
};

export default Form_field;