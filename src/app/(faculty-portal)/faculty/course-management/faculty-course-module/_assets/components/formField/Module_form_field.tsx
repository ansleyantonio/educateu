/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useEffect } from "react";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const Form_field = ({ form, viewOnly }: FormType) => {
  const isViewOnly = viewOnly;
  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies();

  // watch credit value then set value to estimatedTimeToComplete
  // 1 credit = 10 hours
  // Automatically set estimatedTimeToComplete when credit changes
  useEffect(() => {
    const subscription = form.watch((value: any, { name }: any) => {
      if (name === "credit") {
        const creditValue = isNaN(value)
          ? parseInt(value.credit, 10)
          : value.credit;
        const estimatedTime = creditValue * 10;
        form.setValue("estimatedTimeToComplete", estimatedTime);
      }
    });

    return () => subscription.unsubscribe(); // cleanup on unmount
  }, [form]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-top">
        <CustomField.Text
          form={form}
          name="title"
          labelName="module Title"
          placeholder="module Title"
          optional={false}
          viewOnly={isViewOnly}
        />
        {isViewOnly && (
          <CustomField.Text
            form={form}
            name="code"
            labelName="module Code"
            placeholder="module Code"
            optional={false}
            viewOnly={true}
          />
        )}
        <CustomField.SelectField
          form={form}
          name="awardingBodyId"
          labelName="awarding Body"
          placeholder="awarding Body"
          options={awardingBodyOptions}
          optional={false}
          viewOnly={isViewOnly}
        />

        {/* <CustomField.SingleSelectField
          form={form}
          name="moduleType"
          labelName="module Type"
          placeholder="module Type"
          options={["DIPLOMA", "DEGREE"]}
          optional={false}
          viewOnly={isViewOnly}
        /> */}

        <CustomField.SelectField
          form={form}
          name="credit"
          labelName="credit"
          placeholder="credit"
          options={[
            { label: "15", value: 15 },
            { label: "30", value: 30 },
            { label: "45", value: 45 },
            { label: "60", value: 60 },
          ]}
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName="estimated Time To Complete"
          placeholder="estimated Time To Complete"
          disabled={true}
          viewOnly={isViewOnly}
        />
        <CustomField.SwitchField
          form={form}
          name="forumOrDiscussionBoard"
          labelName="forum Discussion Board"
          placeholder="forum Discussion Board"
          // viewOnly={isViewOnly}
          disabled={isViewOnly}
        />
        {/* <CustomField.SelectField
          form={form}
          name="faculty"
          labelName="faculty"
          placeholder="faculty"
          options={["abc", "xyz", "John Doe"]}
          type="single"
          viewOnly={isViewOnly}
        /> */}
      </div>
      <div className="gap-3 w-full md:flex">
        <div className="w-full md:w-1/2">
          <CustomField.TextArea
            form={form}
            name="description"
            labelName="module Description"
            placeholder="module Description"
            viewOnly={isViewOnly}
            optional={false}
          />
        </div>
        <div className="w-full md:w-1/2">
          <CustomField.TextArea
            form={form}
            name="learningOutcome"
            labelName="learning Outcome"
            placeholder="learning Outcome"
            viewOnly={isViewOnly}
          />
        </div>
      </div>
    </>
  );
};

export default Form_field;
