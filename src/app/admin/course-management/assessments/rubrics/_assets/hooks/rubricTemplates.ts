import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useCustomApiMutation } from "../../../assessment/[id]/_assets/hooks/customUseApiMutation";
import { useRouter } from "next/navigation";

export const useCreateRubricTemplate = () => {
  const router = useRouter();
  return useCustomApiMutation({
    path: `rubrics/rubric-templates`,
    method: "POST",
    onSuccess: (data) => {
      console.log("Rubric Template created successfully", data);
      showToast("success", "Rubric Template created successfully", undefined, "toast");
      router.push(`/admin/course-management/assessments/rubrics/${data.data.rubricTemplate.id}`);
    },
    onError: () => {
      console.log("Failed to create rubric template");
      showToast("error", "Failed to create rubric template");
    },
    isSuccessToast: false
  })
}
