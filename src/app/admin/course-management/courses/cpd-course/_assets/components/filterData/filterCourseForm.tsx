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
  certificateFormSchema,
  ICertificateFilterForm,
} from "../../../../_assets/schemas/certificateFilterFormSchema";
import { CertificateCourseFilterDefaultValue } from "../../../../_assets/utils/certificateCourseFilterSchema";

const FilterCourseFrom = ({
  setFilterData,
  setCurrentPage,
  isLoading,
}: {
  setFilterData: (value: ICertificateFilterForm) => void;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
}) => {
  const form = useForm<ICertificateFilterForm>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: CertificateCourseFilterDefaultValue(),
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof certificateFormSchema>) {
    if (values?.durationLength == 0) {
      delete values.durationLength;
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

          {/* Professional Accreditation */}
          {/* <CustomField.Text */}
          {/*   form={form} */}
          {/*   name="professionalAccreditation" */}
          {/*   labelName="Professional Accreditation" */}
          {/*   placeholder="Professional Accreditation" */}
          {/* /> */}

          {/* Duration Length */}
          <CustomField.Text
            form={form}
            name="durationLength"
            labelName="Duration Length"
            placeholder="Duration Length"
          />

          {/* Course Status */}
          <CustomField.SelectField
            form={form}
            name="accreditationStatus"
            labelName="Accreditation Status"
            placeholder="Select Accreditation Status"
            options={[
              {
                value: "ACCREDITED",
                label: "Accredited",
              },
              {
                value: "PROVISIONALLY_ACCREDITED",
                label: "Provisionally Accredited",
              },
              {
                value: "NOT_ACCREDITED",
                label: "Not Accredited",
              },
            ]}
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
