import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import GeneralSetting from "./generalSetting";
import { AvailableFields } from "../utils/formBuilderAvailableFields";
import RubricSetting from "./rubricPanel";
import { useUpdateAssignmentQuestion, useUpdateQuizQuestion } from "../hooks/assessment";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useRubricStore } from "../lib/useRubricStore";
import { connectRubricSchema } from "../schemas/rubricsSchema";
import { useState } from "react";
import { useConnectRubric } from "../hooks/rubric";

export default function RightPanel() {
  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const updateSelectedItem = useFormBuilderStore((state) => state.updateSelectedItem);
  const validateSelectedItem = useFormBuilderStore((state) => state.validateSelectedItem);
  const assessment = useFormBuilderStore((state) => state.assessment);
  const updateQuizQuestion = useUpdateQuizQuestion();
  const updateAssignmentQuestion = useUpdateAssignmentQuestion();
  const [error, setError] = useState<string | null>(null);
  const connectRubric = useConnectRubric();
  const rubric = useRubricStore((state) => state.rubric);
  const disabled = (selectedItem?.type === "SHORT_ANSWER" || selectedItem?.type === "ESSAY" || selectedItem?.type === "FILE_UPLOAD");
  const { selectedTab, setSelectedTab } = useFormBuilderStore();
  const tabs = [
    { label: "General", value: 0, disabled: false },
    { label: "Rubrics", value: 1, disabled: !disabled },
    { label: "Settings", value: 2, disabled: !disabled },
  ]
  const TabsContent = [
    <GeneralSetting key={0} />,
    <RubricSetting key={1} />,
    <div key={2}>tab 3</div>
  ]

  const handleTabSelect = (index: number) => {
    if (index === 2) useFormBuilderStore.getState().toggleAdvanceRubricSetting();
    else setSelectedTab(index);
  }

  const handleConnectRubric = () => {
    console.log("processedRubric", rubric, selectedItem);
    const processedRubric = useRubricStore.getState().getProcessedRubricForConnect();
    console.log("processedRubric 1", rubric, selectedItem);
    const result = connectRubricSchema.safeParse(processedRubric);
    if (!result.success) {
      setError(result.error.errors[0].message);
      console.log(result.error);
      return
    }
    const totalWeight = rubric.rubricCriteria.reduce((total, criteria) => total + (criteria?.weight ?? 0), 0);
    if (totalWeight > (selectedItem?.point ?? 0)) {
      setError("Total rubric weight should be less than or equal to question point");
      return
    }
    setError(null);
    connectRubric.mutate({ ...result.data, assignmentQuestionId: selectedItem?.id }, {
      onSuccess: (data) => {
        console.log("successfully connected rubric criteria", data);
        showToast("success", "Rubric connected successfully", undefined, "toast");
      },
      onError: (error) => {
        console.log(error);
      }
    });
  }


  const handleUpdate = () => {

    if (!validateSelectedItem()) return;
    if (assessment?.assessmentCategory === "QUIZ") {
      updateQuizQuestion.mutate(
        selectedItem,
        {
          onSuccess: () => {
            updateSelectedItem();
            showToast("success", "Question updated successfully", undefined, "toast");
          },
          onError: () => {
            console.log("Failed to update question");
          }
        }
      );
    } else {
      updateAssignmentQuestion.mutate(
        selectedItem,
        {
          onSuccess: () => {
            updateSelectedItem();
            if (rubric.rubricCriteria && rubric.rubricCriteria.length > 0) handleConnectRubric();
            else showToast("success", "Question updated successfully", undefined, "toast");
          },
        }
      );
    }
  }

  return (
    <div className="w-[348px] h-[calc(100vh-5.5rem)] sticky -top-[0px] flex flex-col border-l border-[#CBD5E1]">
      <div className="bg-[#EFF6FF] py-[23px] w-[348px] h-[70px] flex items-center justify-center border-b border-[#CBD5E1]">
        <h1 className="w-[228px] text-lg text-center font-bold text-[#233564]">{AvailableFields.find((el) => el.type === selectedItem?.type)?.label ?? "Question"}</h1>
      </div>
      <div className="flex text-[17px] font-medium gap-[12px] border-b border-[#CBD5E1] items-center justify-between min-h-[68px] flex-row mx-[24px]">
        {tabs.map((tab) => (
          <button key={tab.value} disabled={tab.disabled} onClick={() => handleTabSelect(tab.value)} className={`w-[92px] disabled:cursor-not-allowed disabled:opacity-30 h-full ${selectedTab === tab.value ? "text-[#013E5B] border-b-2 border-[#013E5B]" : ""}`}>{tab.label}</button>
        ))}
      </div>
      <div className="flex flex-col px-[16px] mt-[24px] gap-[24px] overflow-y-auto">
        {TabsContent[selectedTab]}
      </div>
      <button onClick={handleUpdate} className="mx-[16px] mt-[48px] px-[12px] py-[8px] bg-[#34657C] text-white text-[14px] font-normal rounded-[8px] flex items-center justify-center">Apply Changes</button>
      {error && <p className="mx-[16px] text-[#D32F2F] text-[12px]">{error}</p>}
    </div>
  )
}
