/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { CustomField } from "@/components/common/fields/cusInputField";
import ActionButton from "@/components/common/button/actionButton";
import { RefreshCw } from "lucide-react";
import onFormError from "@/utils/formError";
import {
  courseFilterFormSchema,
  IAdvanceCourseFilterForm,
} from "../../../schemas/advanceFilterFormSchema";
import { AdvanceCourseFilterDefaultValue } from "../../../utils/advancedCourseFilterSchema";

const FilterCourseFrom = ({
  courseType,
  setFilterData,
  setCurrentPage,
  isLoading,
}: {
  courseType?: string;
  setFilterData: (value: IAdvanceCourseFilterForm) => void;
  setCurrentPage: (page: number) => void;
  isLoading?: boolean;
}) => {
  const form = useForm<z.infer<typeof courseFilterFormSchema>>({
    resolver: zodResolver(courseFilterFormSchema),
    defaultValues: AdvanceCourseFilterDefaultValue(),
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceCourseFilterForm) {
    if (values?.durationLength == 0) {
      delete values.durationLength;
    }
    if (values?.numberOfSemesters == 0) {
      delete values.numberOfSemesters;
    }
    setFilterData(values);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    setFilterData({});
    form.reset({});
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-2">
          {/* Course Title */}
          <CustomField.Text
            form={form}
            name="title"
            labelName="Course Title"
            placeholder="Course Title"
          />

          {/* Course Code */}
          {/* <CustomField.Text */}
          {/*   form={form} */}
          {/*   name="code" */}
          {/*   labelName="Course Code" */}
          {/*   placeholder="Course Code" */}
          {/* /> */}

          {/* Published Status */}
          <CustomField.SelectField
            form={form}
            name="status"
            labelName="Course Status"
            placeholder="Enter Course Status"
            options={[
              { label: "Published", value: "PUBLISHED" },
              { label: "Unpublished", value: "UNPUBLISHED" },
              { label: "Archived", value: "ARCHIVED" },
            ]}
            type="multiple"
          />

          {/* Study Modes */}
          {/* <CustomField.SelectField */}
          {/*   form={form} */}
          {/*   name="studyModes" */}
          {/*   labelName="Study Modes" */}
          {/*   placeholder="Study Modes" */}
          {/*   type="multiple" */}
          {/*   optional={false} */}
          {/*   options={[ */}
          {/*     { label: "Instructor Led", value: "INSTRUCTOR_LED" }, */}
          {/*     { label: "Cohort Based", value: "COHORT_BASED" }, */}
          {/*     { */}
          {/*       label: "Blended or Hybrid Learning", */}
          {/*       value: "BLENDED_OR_HYBRID_LEARNING", */}
          {/*     }, */}
          {/*     { label: "Self Paced", value: "SELF_PACED" }, */}
          {/*   ]} */}
          {/* /> */}

          {/* Advanced Course Type */}
          {/* <CustomField.SingleSelectField */}
          {/*   form={form} */}
          {/*   name="advancedCourseType" */}
          {/*   labelName="Advanced Course Type" */}
          {/*   placeholder="Advanced Course Type" */}
          {/*   options={["DEGREE", "DIPLOMA"]} */}
          {/* /> */}

          {/* Duration Length */}

          {courseType && courseType.length > 0 && (
            <CustomField.Text
              form={form}
              name="durationLength"
              labelName={`Duration Length (${courseType === "Degree Course" ? "Year" : "Month"})`}
              placeholder="Duration Length"
            />
          )}

          {/* Number of Semesters */}
          <CustomField.Text
            form={form}
            name="numberOfSemesters"
            labelName="Number of Semesters"
            placeholder="Number of Semesters"
          />
        </div>

        {/* Submit button  */}
        <div className="flex gap-x-3 justify-end items-center">
          {/* Reset button  */}
          <ActionButton
            handleOpen={() => handelResetForm()}
            type="submit"
            variant="icon"
            tooltipContent="Reset"
            icon={<RefreshCw />}
          />

          {/* Apply Filter button  */}
          <ActionButton
            isPending={isLoading}
            loadingContent="Applying Filter..."
            type="submit"
            buttonContent="Apply Filter"
            handleOpen={() => form.handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </Form>
  );
};

export default FilterCourseFrom;
