/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/app/hook/userContext";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../schemas/moduleSchema";
import { AdvanceModuleDefaultValue } from "../../utils/advanceModuleDefaultValue";
import Form_field from "../formField/form_field";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

const UpdateAdvanceModuleFrom = ({
  setOpen,
  data,
}: {
  setOpen: any;
  data: any;
}) => {
  const auth = useAuth();
  const token = auth?.user?.accessToken as string;
  const queryClient = useQueryClient();

  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.update),
    defaultValues: AdvanceModuleDefaultValue(data),
  });

  // updateCourseSession
  const updateAdvanceModuleMutation = useApiMutation({
  path: "sub-agent-info/register/",
  method: "PATCH",
  onSuccess: (data) => {
    toast.success("Successfully created sub-agent!");
    form.reset();
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["fetch-All-sub-agents"] });
  },
  onError: (error) => {
    showToast("error", error || "Failed to create sub-agent");
  },
});

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    // createNewSubAgentMutation.mutate(values);
    console.log("update session", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field form={form} />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={updateAdvanceModuleMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {updateAdvanceModuleMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateAdvanceModuleFrom;

const updateValue = {
  courseTitle: "Blanditiis enim non ",
  courseCode: "Dolore culpa culpa q",
  hesaCourseId: "Ullam odit aut vel s",
  courseType: "diploma",
  typeOfDegree: "undergraduate",
  typeOfDiploma: "higherEducation",
  intendedAward: "Incidunt nostrum pr",
  courseDescription: "Consequuntur aliquid",
  studyModes: ["selfPaced"],
  courseStartDate: "2025-02-17T18:00:00.000Z",
  courseEndDate: "2025-02-23T18:00:00.000Z",
  academicSessions: "pending",
  diplomaCourseLengthInMonths: "2",
  degreeCourseLengthInYears: "1990",
  numberOfSemesters: "4",
  totalCreditsRequired: "33",
  year1ExpectedCourseCredits: "33",
  year2ExpectedCourseCredits: "44",
  year3ExpectedCourseCredits: "43",
  minimumPassingCreditPerYear: "33",
  awardingInstitutionName: "winter-2025",
  awardingBodyCode: "Et est laboris elig",
  tuitionFeePerYear: "2019",
  tuitionFeePerModule: "Consectetur incidunt",
  fundingInformation: "sponsorships",
  accreditingBody: "Et voluptatum eum ci",
  accreditationStatus: "provisionally",
  qualificationAim: "honours",
  courseApprovalDate: "2025-02-10T18:00:00.000Z",
  reviewDate: "2025-02-16T18:00:00.000Z",
  courseLeader: "Sit eveniet quo omn",
  governanceNotes: "In officia aut quo m",
};
