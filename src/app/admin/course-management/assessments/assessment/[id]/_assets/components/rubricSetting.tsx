import { useEffect, useState } from "react";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { useRubricStore } from "../lib/useRubricStore";
import { connectRubricSchema, Rubric, RubricCriteria } from "../schemas/rubricsSchema";
import { useConnectRubric, useCreateRubricTemplate, useDeleteRubricCriteria, useGetRubric, useGetRubricTemplates, useUpdateRubricCriteria } from "../hooks/rubric";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/common/TostMessage/customTostMessage";


export const RubricCriteriaItemMockup = ({ criteria, index }: { criteria: RubricCriteria, index: number }) => {

  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const updateRubricCriteria = useUpdateRubricCriteria();

  const [edit, setEdit] = useState(false);
  const handleSave = () => {
    if (criteria.id.length > 0 && !criteria.id.startsWith("null")) {
      updateRubricCriteria.mutate({
        rubricCriteriaId: criteria.id,
        ...criteria
      }, {
        onSuccess: () => {
          showToast("success", "Rubric updated successfully", undefined, "toast");
        },
        onError: () => {
          showToast("error", "Failed to update rubric");
        }
      }
      )
    }
    setEdit(false);
  }

  return (
    <div
      className="border bg-white flex flex-col items-center border-[#E2E8F0] rounded-md text-[14px] text-[#8C8C8C]"
    >
      {edit ? (
        <>
          <div className="w-full flex text-[#0F172A] flex-col p-[24px] gap-[8px]">
            <p>Criteria Name</p>
            <input className="w-full border border-[#E2E8F0] rounded-md p-[8px]" value={criteria.name} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, name: e.target.value })
            } />
          </div>
          {/* description */}
          <div className="w-full flex text-[#0F172A] flex-col p-[24px] gap-[8px]">
            <p>Description</p>
            <Textarea className="w-full border border-[#E2E8F0] rounded-md p-[8px]" value={criteria.description} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, description: e.target.value })
            } />
          </div>
          {/* weight */}
          <div className="w-full flex text-[#0F172A] flex-col p-[24px] gap-[8px]">
            <p>Weight</p>
            <input className="w-full border border-[#E2E8F0] rounded-md p-[8px]" type="number" value={criteria.weight} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, weight: parseInt(e.target.value) })} />
          </div>
          {/* levels */}
          <div className="w-full flex text-[#0F172A] flex-col p-[24px] gap-[8px]">
            {criteria.levels && criteria.levels.map((level, levelIndex) => (
              <div key={index} className="flex flex-col gap-[12px] p-[12px] border rounded-md border-[#E2E8F0]">
                <p className="font-medium text-[#334155]">Level {levelIndex + 1}</p>

                {/* Name */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Name</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="text"
                    value={level.name}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, { ...level, name: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Description</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="text"
                    value={level.description}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, { ...level, description: e.target.value })
                    }
                  />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Weight</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="number"
                    value={level.weight}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, {
                          ...level,
                          weight: parseInt(e.target.value),
                        })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="bg-[#3B82F6] text-white py-[8px] px-[16px] rounded-md" onClick={() => useRubricStore.getState().addRubricCriteriaLevel(index)}>Add Level</button>
        </>
      ) : (
        <>
          <div className="w-full flex flex-row justify-between p-[24px]">
            <div className="flex flex-row gap-[16px] items-center justify-between">
              <div
                className="w-[20px] relative">
                <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
              </div>
              <h2 className="text-[17px] font-semibold text-[#0F172A]">{criteria.name}</h2>
            </div>
            <div className="text-[14px] flex items-center justify-center bg-[#EFF6FF] border-[#3B82F6] rounded-full py-[2px] px-[16px] border font-semibold text-[#2563EB]">{((criteria?.weight ?? 0) / Math.max(selectedItem?.point ?? 1, 1) * 100).toFixed(2)}%</div>
          </div>
          <div className="flex flex-col items-center justify-between gap-[16px] w-full border-y p-[24px]">
            <div className="w-full flex flex-row justify-between">
              <p>{criteria.description}</p>
              <p>{criteria?.weight} Points</p>
            </div>
            <div className="w-full flex flex-row justify-between gap-[10px]">
              {criteria.levels && criteria.levels.map((level, index) => (
                <div key={index} className={`${index === 0 ? "bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]" : "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]"} text-[14px] border rounded-[4px] h-[40px] flex-1  flex justify-center items-center gap-[8px]`}>
                  <p>{level.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="w-full flex flex-row items-center justify-end text-[14px] text-[#2563EB] py-[12px] px-[24px]">
        {edit ? <button onClick={() => handleSave()}>Save</button> : <button onClick={() => setEdit(true)}>Edit</button>}
      </div>
    </div >
  );
};

const RubricCriteriaItem = ({ criteria, index }: { criteria: RubricCriteria, index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: criteria.id,
    data: {
      panel: "rubric",
      index: index,
    }
  });

  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const updateRubricCriteria = useUpdateRubricCriteria();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [edit, setEdit] = useState(false);
  const handleSave = () => {
    if (criteria.id.length > 0 && !criteria.id.startsWith("null")) {
      updateRubricCriteria.mutate({
        rubricCriteriaId: criteria.id,
        ...criteria
      }, {
        onSuccess: () => {
          showToast("success", "Rubric updated successfully", undefined, "toast");
        },
        onError: () => {
          showToast("error", "Failed to update rubric");
        }
      }
      )
    }
    setEdit(false);
  }

  const removeCriteria = useDeleteRubricCriteria();
  const handleRemoveCriteria = () => {
    if (criteria.id.length > 0 && !criteria.id.startsWith("null")) {
      removeCriteria.mutate({
        rubricCriteriaId: criteria.id
      }, {
        onSuccess: () => {
          showToast("success", "Rubric criteria removed  successfully", undefined, "toast");
          useRubricStore.getState().removeRubricCriteria(criteria.id);
        }
      })
    } else useRubricStore.getState().removeRubricCriteria(criteria.id);
  }

  return (
    <div
      style={style}
      ref={setNodeRef}
      className="border flex flex-col items-center border-[#E2E8F0] rounded-md text-[14px] text-[#8C8C8C]"
    >
      {edit ? (
        <div className="w-full flex flex-col py-[24px] gap-[24px]">
          <div className="w-full flex text-[#0F172A] flex-col px-[24px] gap-[8px]">
            <p>Criteria Name</p>
            <input className="w-full border border-[#E2E8F0] rounded-md p-[8px]" value={criteria.name} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, name: e.target.value })
            } />
          </div>
          {/* description */}
          <div className="w-full flex text-[#0F172A] flex-col px-[24px] gap-[8px]">
            <p>Criteria Description</p>
            <Textarea className="w-full border border-[#E2E8F0] rounded-md p-[8px]" value={criteria.description} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, description: e.target.value })
            } />
          </div>
          {/* weight */}
          <div className="w-full flex text-[#0F172A] flex-col px-[24px] gap-[8px]">
            <p>Criteria Weight</p>
            <input className="w-full border border-[#E2E8F0] rounded-md p-[8px]" type="number" value={criteria.weight} onChange={(e) => useRubricStore.getState().updateRubricCriteria(index, { ...criteria, weight: parseInt(e.target.value) })} />
          </div>
          {/* levels */}
          <div className="w-full flex text-[#0F172A] flex-col px-[24px] gap-[24px]">
            {criteria.levels && criteria.levels.map((level, levelIndex) => (
              <div key={index} className="flex flex-col gap-[12px] shadow-sm p-[12px] border rounded-md border-[#E2E8F0]">
                <div className="flex flex-row gap-[12px] items-center justify-between">
                  <p className="font-medium text-[#0F172A]">Level {levelIndex + 1}</p>
                  <button onClick={() => useRubricStore.getState().removeRubricCriteriaLevel(index, levelIndex)}>
                    <img src="/assets/icons/delete-02.svg" alt="" />
                  </button>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Level Name</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="text"
                    value={level.name}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, { ...level, name: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Level Description</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="text"
                    value={level.description}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, { ...level, description: e.target.value })
                    }
                  />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[14px] text-[#475569]">Level Weight</p>
                  <input
                    className="w-full border border-[#E2E8F0] rounded-md p-[8px]"
                    type="number"
                    value={level.weight}
                    onChange={(e) =>
                      useRubricStore
                        .getState()
                        .updateRubricCriteriaLevel(index, levelIndex, {
                          ...level,
                          weight: parseInt(e.target.value),
                        })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="bg-[#34657C] text-white py-[8px] px-[16px] mx-[24px] rounded-md" onClick={() => useRubricStore.getState().addRubricCriteriaLevel(index)}>Add Level</button>
        </div>
      ) : (
        <>
          <div className="w-full flex flex-row justify-between p-[24px]">
            <div className="flex flex-row gap-[16px] items-center justify-between">
              <div
                {...attributes}
                {...listeners}
                className="w-[20px] relative hover:cursor-grab">
                <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
              </div>
              <h2 className="text-[17px] font-semibold text-[#0F172A]">{criteria.name}</h2>
            </div>
            <div className="text-[14px] flex items-center justify-center bg-[#EFF6FF] border-[#3B82F6] rounded-full py-[2px] px-[16px] border font-semibold text-[#2563EB]">{((criteria?.weight ?? 0) / Math.max(selectedItem?.point ?? 0, 1) * 100).toFixed(2)}%</div>
          </div>
          <div className="flex flex-col items-center justify-between gap-[16px] w-full border-y p-[24px]">
            <div className="w-full flex flex-row justify-between">
              <p>{criteria.description}</p>
              <p>{criteria?.weight} Points</p>
            </div>
            <div className="w-full flex flex-row justify-between gap-[10px]">
              {criteria.levels && criteria.levels.map((level, index) => (
                <div key={index} className={`${index === 0 ? "bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]" : "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]"} text-[14px] border rounded-[4px] h-[40px] flex-1  flex justify-center items-center gap-[8px]`}>
                  <p>{level.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="w-full flex flex-row items-center justify-end text-[14px] text-[#2563EB] py-[12px] px-[24px]">
        <button className="mr-[12px] text-red-500" onClick={() => handleRemoveCriteria()}>Remove</button>
        {edit ? <button onClick={() => handleSave()}>Done</button> : <button onClick={() => setEdit(true)}>Edit</button>}
      </div>
    </div >
  );
};

export default function RubricSetting() {
  const assessment = useFormBuilderStore((state) => state.assessment);
  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const rubric = useRubricStore((state) => state.rubric);
  const rubricTemplates = useRubricStore((state) => state.rubricTemplates);
  const { data: rubricData, refetch: refetchRubric, isFetching, isError } = useGetRubric(selectedItem?.id ?? "");
  const { data: rubricTemplatesData, isFetching: isFetchingTemplate, isError: isErrorTemplate } = useGetRubricTemplates();
  const toggleAdvanceRubricSetting = useFormBuilderStore((state) => state.toggleAdvanceRubricSetting);
  const connectRubric = useConnectRubric();
  const [error, setError] = useState<string | null>(null);
  const createRubricTemplate = useCreateRubricTemplate();
  const rubricName = useRubricStore((state) => state.rubricName);
  const rubricDescription = useRubricStore((state) => state.rubricDescription);


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


  const handleOnSelect = (id: string) => {
    const template = rubricTemplates.find((template: Rubric) => template.id === id);
    if (template) {
      useRubricStore.getState().updateRubric(template);
      // useRubricStore.setState({ rubricName: template?.name ?? "", rubricDescription: template?.description ?? "" });
    }
  }

  const checkCustomName = (name: string) => {
    if (name === rubricTemplates.find((template: Rubric) => template.name === name && template.id === rubric?.id)?.name) {
      return false
    }
    return true
  }


  const handleConnectRubric = ({ template, }: { template?: boolean, }) => {
    const processedRubric = useRubricStore.getState().getProcessedRubricForConnect();
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
        if (template) {
          createRubricTemplate.mutate({
            assignmentQuestionId: selectedItem?.id,
            templateName: result.data.rubricName
          }, {
            onSuccess: (data) => {
              console.log("successfully created rubric template", data);
              showToast("success", "Rubric connected successfully", undefined, "toast");
              refetchRubric();
            },
            onError: (error) => {
              console.log(error);
            }
          });
        } else showToast("success", "Rubric connected successfully", undefined, "toast");
      },
      onError: (error) => {
        console.log(error);
      }
    });
  }

  return (
    <div className="flex flex-row gap-[34px] w-full">
      <div className="flex flex-col p-[24px] pt-[10px] rounded-[10px] gap-[24px] justify-between border border-[#CBD5E1] flex-1">
        <div className="w-full h-full flex flex-col">
          <button onClick={() => toggleAdvanceRubricSetting()} className="flex flex-row gap-[4px] pt-[10px] items-center hover:translate-x-[-4px] transition-all cursor-pointer">
            <ChevronLeft className="" />
            Back
          </button>
          <p className="py-[10px] text-[26px] font-bold text-[#233564]">Rubrics Setting</p>
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[10px] py-[12px] border border-[#CBD5E1] rounded-[4px]">
              <div className="flex flex-col  gap-[7px] px-[24px] py-[12px]">
                <p className="text-[14px] text-left text-[#0F172A]">Rubric Name</p>
                <input onChange={(e) => useRubricStore.setState({ rubricName: e.target.value })} type="text" placeholder="Rubric Name" className="w-full border border-[#CBD5E1] rounded-[4px] h-[40px] px-[12px]" value={rubricName} />
              </div>
              <div className="flex flex-col text-[14px] gap-[7px] px-[24px] py-[12px]">
                <p className="text-[14px] text-left text-[#0F172A]">Rubric Description</p>
                <Textarea onChange={(e) => useRubricStore.setState({ rubricDescription: e.target.value })} placeholder="Rubric Description" className="w-full border border-[#CBD5E1] rounded-[4px] h-[40px] px-[12px]" value={rubricDescription} />
              </div>
              <div className="flex flex-col  gap-[7px] px-[24px] py-[12px]">
                <p className="text-[14px] text-left text-[#0F172A]">Rubric Name</p>
                <div className="flex flex-row w-full border border-[#CBD5E1] rounded-[2px]">
                  <button onClick={() => useRubricStore.setState({ rubric: { ...rubric, name: rubricTemplates.find((template: Rubric) => template.id === rubric?.id)?.name } })} className={`flex-1 py-[10px] px-[8px] ${!checkCustomName(rubric?.name ?? "") ? "bg-[#EFF6FF]" : ""} text-[14px]`}>Equal</button>
                  <button onClick={() => useRubricStore.setState({ rubric: { ...rubric, name: "" } })} className={`flex-1 py-[10px] px-[8px] ${checkCustomName(rubric?.name ?? "") ? "bg-[#EFF6FF]" : ""} text-[14px] border-l border-[#CBD5E1]`}>Custom</button>
                </div>
              </div>
              <div className="flex flex-col text-[14px] gap-[7px] px-[24px] py-[12px]">
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
            </div>
            <div className="flex text-[14px] flex-col py-[12px] px-[24px] gap-[7px] border border-[#CBD5E1] rounded-[4px]">
              <p>Total Weight</p>
              <div className="flex flex-row items-center justify-between gap-[4px]">
                <Progress value={(selectedItem?.point ?? 0) / (assessment?.totalPointsOrWeight ?? 0) * 100} color="#1891fe" className="[&>div]:!bg-[#1891fe] bg-[#F5F5F5]" max={100} />
                {`${(selectedItem?.point ?? 0) / (assessment?.totalPointsOrWeight ?? 0) * 100}%`}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-[24px] text-[14px] justify-between">
          <button onClick={() => toggleAdvanceRubricSetting()} className="py-[8px] px-[24px] border border-[#CBD5E1] rounded-[8px]">Cancel</button>
          <button onClick={() => handleConnectRubric({ template: true })} className="flex-1 py-[8px] border border-[#CBD5E1] rounded-[8px]">Save as Template</button>
          <button onClick={() => handleConnectRubric({ template: false })} className="py-[8px] px-[24px] bg-[#34657C] text-white rounded-[8px]">Save</button>
        </div>
        {error && <p className="text-[14px] text-[#FF0000]">{error}</p>}
      </div>

      <div className="flex flex-col gap-[24px] p-[24px] rounded-[10px] justify-between border flex-1 border-[#CBD5E1]">
        <div className="flex flex-col gap-[16px]">
          <p className="pt-[24px] text-[26px] font-bold text-[#233564]">Criteria</p>
          {!rubric.rubricCriteria || rubric.rubricCriteria?.length === 0 ? <p className="text-[14px] text-[#8C8C8C]">No criteria added yet</p> :
            <SortableContext items={rubric?.rubricCriteria?.map((el: RubricCriteria) => el.id)} strategy={verticalListSortingStrategy}>
              {rubric?.rubricCriteria?.map((criteria: RubricCriteria, index: number) => (
                <RubricCriteriaItem key={criteria.id} criteria={criteria} index={index} />
              ))}
            </SortableContext>
          }
        </div>
        <button onClick={() => useRubricStore.getState().addRubricCriteria()} className="py-[8px] px-[12px] border border-[#CBD5E1] text-[14px] text-[#475569] rounded-[8px]">Add Criterion</button>
      </div>
    </div>
  )
}
