import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetRubric, useGetRubricTemplates } from "../hooks/rubric";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { useEffect, } from "react";
import { useRubricStore } from "../lib/useRubricStore";
import { Rubric } from "../schemas/rubricsSchema";
import { Switch } from "antd";

export default function RubricPanel() {

  const assessment = useFormBuilderStore((state) => state.assessment);
  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const rubric = useRubricStore((state) => state.rubric);
  const rubricTemplates = useRubricStore((state) => state.rubricTemplates);
  const { data: rubricData, } = useGetRubric(selectedItem?.id ?? "");
  const { data: rubricTemplatesData, } = useGetRubricTemplates();
  const toggleAdvanceRubricSetting = useFormBuilderStore((state) => state.toggleAdvanceRubricSetting);
  const rubricName = useRubricStore((state) => state.rubricName);
  const rubricDescription = useRubricStore((state) => state.rubricDescription);
  const activeRubrics = useRubricStore((state) => state.activeRubrics);

  useEffect(() => {
    const newRubric = rubricData?.data;
    if (newRubric) {
      useRubricStore.getState().updateRubric(newRubric);
    }
  }, [rubricData]);

  useEffect(() => {
    if (rubricTemplatesData) {
      useRubricStore.getState().setRubricTemplates(rubricTemplatesData.data.rubricTemplates);
    }
  }, [rubricTemplatesData]);

  // useEffect(() => {
  //   if (selectedItem && (selectedItem.type === "SHORT_ANSWER" || selectedItem.type === "ESSAY" || selectedItem.type === "FILE_UPLOAD")) {
  //     console.log("changing selected item", selectedItem)
  //     useRubricStore.setState({ rubricName: selectedItem?.rubricName ?? "", rubricDescription: selectedItem.rubricDescription ?? "" });
  //   }
  // }, [selectedItem]);

  const handleOnSelect = (id: string) => {
    const template = rubricTemplates.find((template: Rubric) => template.id === id);
    if (template) {
      useRubricStore.getState().updateRubric(template);
      // ISSUE: NO way to get rubric temlates description
      // useRubricStore.setState({ rubricName: template?.name ?? "", rubricDescription: template?.description ?? ""  });
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-[8px]">
        <p>Rubric Name</p>
        <input value={rubricName} onChange={(e) => useRubricStore.setState({ rubricName: e.target.value })} className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]" />
      </div>
      <div className="flex flex-col gap-[8px]">
        <p>Description</p>
        <textarea value={rubricDescription} onChange={(e) => useRubricStore.setState({ rubricDescription: e.target.value })} className="w-full border border-[#CBD5E1] rounded-[2px] h-[129px] px-[12px] py-[8px]" />
      </div>
      <div className="flex flex-col gap-[8px]">
        <p>Total Points</p>
        <input
          className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px]"
          value={selectedItem?.point} onChange={(e) => selectedItem && useFormBuilderStore.getState().setSelectedItem({ ...selectedItem, point: Number(e.target.value) })} type="number" />
      </div>
      <div className="flex flex-col gap-[8px]">
        <p>Total Weight</p>
        <input placeholder={`${(selectedItem?.point ?? 0) / (assessment?.totalPointsOrWeight ?? 0) * 100}%`} type="number"
          disabled
          className="h-[40px] bg-transparent border border-[#CBD5E1] rounded-[4px] px-[12px] disabled:cursor-not-allowed" />
      </div>
      <div className="flex flex-col gap-[8px]">
        <p>Template Library</p>
        <Select onValueChange={handleOnSelect}>
          <SelectTrigger className="w-full border border-[#CBD5E1] rounded-[2px] h-[40px] px-[12px] py-[8px]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {rubricTemplates && rubricTemplates.map((template: Rubric) => (
              <SelectItem key={template.id} value={template?.id ?? ""}>{template.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {rubric.rubricCriteria && rubric.rubricCriteria.map((criteria, index) => (
        <div key={index} className="flex flex-col gap-[8px]">
          <p className="flex flex-row justify-between items-center">{criteria.name}<span className="text-[#2563EB]">{criteria.weight}</span></p>
          <div className="flex flex-row gap-[10px] h-[79px]">
            {criteria.levels && criteria.levels.map((level, index) => (
              <div key={index} className={`${index === 0 ? "bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]" : "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]"} text-[14px] border rounded-[4px] flex flex-col items-center justify-center gap-[4px] flex-1`}>
                <p>{level.name}</p>
                <p className="text-[#475569]">{((level.weight * (criteria?.weight ?? 0)) / 100).toFixed(2)}pts</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-[24px] items-end ">
        <button className="text-[#2563EB]" onClick={() => toggleAdvanceRubricSetting()}>Advanced Rubrics Setting</button>
        <div className="flex flex-row gap-[8px] items-center w-full justify-between">
          <p>Active Rubrics</p>
          <Switch checked={activeRubrics} onClick={(checked: boolean) => useRubricStore.setState({ activeRubrics: checked })} />
        </div>
      </div>
    </div>
  );
}
