import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import React, { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  assessmentCategoryOptions,
  assessmentTypeOptions,
} from "../utils/constants";
import { isDetailsFormValid } from "../utils/helper";
import {
  Assessment,
  AwardingBodiesResponse,
  CreateAssessmentValues,
} from "../utils/types";

export default function AssessmentDetailedForm({
  form,
  setOpen,
  onActiveTab,
  isEditMode
}: {
  isEditMode?: boolean
  onActiveTab: Dispatch<SetStateAction<string>>;
  form: UseFormReturn<CreateAssessmentValues | Assessment>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data } = useFetchData({
    path: `assessments/awarding-bodies`,
    method: "GET",
    queryKey: "fetch-list-of-awarding-bodies",
  });
  const awardingBodyData = data as AwardingBodiesResponse | undefined;

  const assessmentType = form.watch("assessmentType");
  const assessmentCategory = form.watch("assessmentCategory");
  const isAwardingBodyRequired =
    assessmentType === "DEGREE" || assessmentType === "DIPLOMA";





  return (
    <React.Fragment>
      <div className="space-y-4">
        <CustomField.Text
          form={form}
          name="nameOrTitle"
          labelName="Name/Title"
          optional={false}
          placeholder="Enter assessment title"
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomField.SelectField
            form={form}
            disabled={isEditMode}
            name="assessmentCategory"
            labelName="Assessment Category"
            optional={false}
            placeholder="Select category"
            options={assessmentCategoryOptions}
            onValueChange={(val) => {
              if (val !== "QUIZ") {
                form.clearErrors("questionSize");
                form.unregister("questionSize")
              }
            }}
          />
          <CustomField.SelectField
            form={form}
            disabled={isEditMode}
            name="assessmentType"
            labelName="Assessment Type"
            optional={false}
            placeholder="Select type"
            options={assessmentTypeOptions}
            onValueChange={(val) => {
              if (val === "CPD" || val === "PROFESSIONAL") {
                form.clearErrors("awardingBodyId");
                form.unregister("awardingBodyId")
              }

            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CustomField.Text
            form={form}
            name="assessmentCode"
            labelName="Assessment Code"
            optional={true}
            placeholder="Enter assessment code"
          />
          {assessmentCategory === "QUIZ" && (
            <CustomField.Number
              form={form}
              name="questionSize"
              labelName="Question Size"
              optional={false}

              placeholder="Enter number of questions"
            />
          )}
        </div>

        {isAwardingBodyRequired && (
          <CustomField.SelectField
            form={form}
            name="awardingBodyId"
            labelName="Awarding Body"
            optional={false}
            placeholder="Select awarding body"
            options={
              awardingBodyData?.data?.awardingBodies?.map((awardingBody) => ({
                label: awardingBody.name,
                value: awardingBody.id,
              })) || []
            }
          />
        )}
        <CustomField.TextArea
          form={form}
          name="descriptionOrInstructions"
          labelName="Description/Instructions"
          optional={false}
          placeholder="Enter detailed instructions for students"
        />
      </div>

      <FormAction onActiveTab={onActiveTab} setOpen={setOpen} form={form} />
    </React.Fragment>
  );
}

function FormAction({
  setOpen,
  onActiveTab,
  form,
}: {
  onActiveTab: Dispatch<SetStateAction<string>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<CreateAssessmentValues | Assessment>;
}) {

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button type="button" onClick={async () => {
        const isValid = await isDetailsFormValid({ form })
        if (isValid) {
          onActiveTab("schedule")
        }
      }}>
        Next
      </Button>
    </div>
  );
}
