/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Switch } from "@/components/ui/custom_ui/switch";

const AssessmentDetails = ({ assessmentId }: { assessmentId: string }) => {
  console.log("assessmentId", assessmentId);
  const allowLateSubmit = useApiMutation({
    method: "POST",
    path: `faculty-course-module/assessment/${assessmentId}/late-submissions`,
    onSuccess: (data: any) => {
      showToast("success", data);
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    allowLateSubmit.mutate({ [field]: value });
  };
  // faculty-course-module/assessment/{{assessmentId}}/late-submissions
  // {"lateSubmissions": true}

  return (
    <div className="mt-4 space-y-4">
      {/* Allow Late Submissions */}
      <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="font-semibold">Allow Late Submissions</h2>
          <p className="text-xs text-gray-500">
            Students will be able to submit after the due date with a
            &rdquo;Late Submission&quot; link
          </p>
        </div>

        <Switch
          id="allow-late"
          //  checked={state.allowLate}
          onCheckedChange={(checked) =>
            handleToggle("lateSubmissions", checked)
          }
        />
      </div>

      {/* Mitigating Circumstances */}
      {/* <div className="flex justify-between items-center py-2 px-4 bg-white rounded-lg border border-gray-200 shadow-sm"> */}
      {/*   <div> */}
      {/*     <h2 className="font-semibold">Enable Mitigating Circumstances</h2> */}
      {/*     <p className="text-xs text-gray-500"> */}
      {/*       Allow specific students to submit after the deadline */}
      {/*     </p> */}
      {/*   </div> */}
      {/**/}
      {/*   <Switch */}
      {/*     id="mitigating-circumstances" */}
      {/*     //         checked={state.mitigatingCircumstances} */}
      {/*     onCheckedChange={(checked) => */}
      {/*       handleToggle("mitigatingCircumstances", checked) */}
      {/*     } */}
      {/*   /> */}
      {/* </div> */}
    </div>
  );
};

export default AssessmentDetails;
