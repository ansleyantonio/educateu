import React, { useEffect, useMemo, } from "react";
import { FormElement } from "../schemas/formBuilderSchemas";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { Square, SquareCheck } from "lucide-react";
import { generateColorShades } from "@/utils/GenerateColorShades";
import RenderMatching from "./renderMatching";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS, Transform } from "@dnd-kit/utilities";
import { useCreateAssignmentQuestion, useCreateQuizQuestion, useDeleteAssignmentQuestion, useDeleteQuizQuestion, useUpdateAssignmentQuestion } from "../hooks/assessment";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { DraggableAttributes, UseDraggableArguments } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { getDefaultElement } from "../utils/formBuilderDefaults";

interface RenderFormElementProps {
  item: FormElement;
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes
  transform?: Transform | null;
  transition?: string | null
  isDragging?: boolean
}

export const OrderingOptionMockup = ({ id, itemId }: { id: string, itemId: string }) => {
  const item = useFormBuilderStore((state) => state.items.find((el) => el.id === itemId));
  if (item?.type !== "ORDERING") return null;
  // const text = useMemo(() => item?.options.find((el) => el.id === id)?.text, [item, id]);
  // const idx = useMemo(() => item?.options.findIndex((el) => el.id === id), [item, id]);
  const text = item?.options.find((el) => el.id === id)?.text;
  const idx = item?.options.findIndex((el) => el.id === id);

  return (
    <div
      className="border bg-white flex flex-row items-center gap-[8px] border-[#E2E8F0] rounded-md py-[8px] px-[12px] text-[14px] text-[#8C8C8C]"
    >
      <div
        className="w-[10px] relative ">
        <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
      </div>
      <span className="flex justify-center h-[28px] w-[28px] text-center bg-[#F3F4F6] rounded-full items-center">{idx + 1}</span> {text}
    </div>
  )
}

const OrderingOption = ({ id, itemId, idx, text }: { id: string, itemId: string, idx: number, text: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      panel: "element",
      itemId: itemId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      style={style}
      key={id ?? idx}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="border flex flex-row items-center gap-[8px] border-[#E2E8F0] rounded-md py-[8px] px-[12px] text-[14px] text-[#8C8C8C]"
    >
      <div
        className="w-[10px] relative">
        <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
        {/* <div  {...listeners} {...attributes} role="none" className="absolute hover:cursor-grab -inset-4 w-8 h-8" /> */}
      </div>
      <span className="flex justify-center h-[28px] w-[28px] text-center bg-[#F3F4F6] rounded-full items-center">{idx + 1}</span> {text}
    </div>
  )
}

const RenderFormElement: React.FC<RenderFormElementProps> = ({ item, listeners, attributes, transform, transition, isDragging }) => {
  const removeItemAtIndex = useFormBuilderStore((state) => state.removeItemAtIndex);
  const duplicateItemAtIndex = useFormBuilderStore((state) => state.duplicateItemAtIndex);
  const assessmentId = useFormBuilderStore((state) => state.assessmentId);
  const assessment = useFormBuilderStore((state) => state.assessment);
  const createQuizQuestion = useCreateQuizQuestion();
  const deleteQuizQuestion = useDeleteQuizQuestion(item.id);

  const createAssignmentQuestion = useCreateAssignmentQuestion();
  const updateAssignmentQuestion = useUpdateAssignmentQuestion();
  const deleteAssignmentQuestion = useDeleteAssignmentQuestion(item.id);
  const getIndex = useFormBuilderStore((state) => state.getIndex);
  const getItem = useFormBuilderStore((state) => state.getItem);

  const handleDelete = (id: string) => {
    const item = getItem(id);
    if (!item) return;
    if (assessment?.assessmentCategory === "QUIZ") {
      deleteQuizQuestion.mutate({}, {
        onSuccess: () => {
          removeItemAtIndex(item.id);
          console.log("Question deleted successfully");
        },
        onError: () => {
          console.log("Failed to delete question");
          showToast("error", "Failed to delete question");
        }
      });
    } else {
      deleteAssignmentQuestion.mutate({}, {
        onSuccess: () => {
          removeItemAtIndex(item.id);
          console.log("Question deleted successfully");
        },
        onError: () => {
          console.log("Failed to delete question");
          showToast("error", "Failed to delete question");
        }
      });
    }
  }

  const handleDuplicate = (id: string) => {
    const item = getItem(id);
    if (!item) return;
    duplicateItemAtIndex(item.id);
    if (assessment?.assessmentCategory === "QUIZ") {
      createQuizQuestion.mutate({
        assessmentId: assessmentId,
        type: item.type,
        index: getIndex(item.id) + 1
      }, {
        onSuccess: () => {
          console.log("Question duplicated successfully");
        },
        onError: () => {
          console.log("Failed to duplicate question");
          showToast("error", "Failed to duplicate question");
        }
      })
    } else {
      createAssignmentQuestion.mutate({
        assessmentId: assessmentId,
        type: item.type,
        index: getIndex(item.id) + 1
      }, {
        onSuccess: (data) => {
          const response = data.data.assignmentQuestion;
          console.log("response", response);
          const defaltElement = { ...getDefaultElement(item.type), id: response.id };
          updateAssignmentQuestion.mutate(
            defaltElement, {
            onSuccess: (data) => {
              console.log(data);
            },
            onError: () => {
              console.log("Failed to update question");
              // showToast("error", "Failed to update question");
            }
          }
          )
          // addItematIndex(Number(over.id), { ...getDefaultElement(activeId), id: response.id });
          console.log("Question created successfully");
        },
        onError: () => {
          console.log("Failed to duplicate question");
          showToast("error", "Failed to duplicate question");
        }
      })
    }
  }

  const Handle = () => {
    if (!listeners || !attributes) return (
      <div className="flex w-[14px] relative">
        <img height={20} src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
        <div className="absolute hover:cursor-grabbing -inset-4 w-16 h-16" />
      </div>
    )
    return (
      <div className="flex relative min-w-[14px]">
        <img height={20} src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
        <div  {...listeners} {...attributes} role="none" className="absolute hover:cursor-grab -inset-4 w-16 h-16" />
      </div>
    );
  }
  const QuickAction = ({ id }: { id: string }) => {
    return (
      <div className="flex flex-row min-w-[54px] gap-[6px]">
        <button onClick={() => handleDuplicate(id)}>
          <img height={24} width={24} src="/assets/icons/copy-01.svg" alt="" />
        </button>
        <button onClick={() => handleDelete(id)}>
          <img height={24} width={24} src="/assets/icons/delete-02.svg" alt="" />
        </button>
      </div>
    );
  }

  const { shuffledRightSideIndex, leftToRightSideIndex, colorShades } = useMemo(() => {
    if (item.type !== "MATCHING") return { shuffledRightSideIndex: [], leftToRightSideIndex: [], colorShades: [] };
    const shuffledRightSideIndex = item.options.rightSide.map((el) =>
      item.answer?.findIndex((pair) => pair.rightSideId === el.id)
    );

    const leftToRightSideIndex = item.answer?.map((pair) =>
      item.options.rightSide.findIndex((item) => item?.id === pair.rightSideId)
    );

    const colorShades = generateColorShades(item.answer?.length);

    return { shuffledRightSideIndex, leftToRightSideIndex, colorShades };
  }, [item]);


  switch (item.type) {
    case "MULTIPLE_CHOICE":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">{item.questionText}</h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-[12px]">
            {item.options?.map((option) => (
              <label key={option.id} className="flex flex-row items-center gap-[8px]">
                {item.answer?.includes(option.id) ? <img src="/assets/icons/dot-circle-solid.svg" alt="" />
                  : <img src="/assets/icons/circle.svg" alt="" />
                }
                <span className="text-[14px] text-[#8C8C8C]">{option.text}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="border-b border-[#CBD5E1]" />
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Multiple Choice {item.point ?? 0} Point
            </div>
            {/* <p className="text-[12px] text-[#0F172A] font-medium">With Rubric</p> */}
          </div>
        </div>
      );

    case "MULTIPLE_SELECT":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-[12px]">
            {item.options?.map((option) => (
              <label
                key={option.id}
                className="flex flex-row items-center gap-[8px]"
              >
                <div className="w-[20px]">
                  {item.answer?.includes(option.id) ? <SquareCheck size={20} className="text-[#8C8C8C]" />
                    : <Square size={20} className="text-[#8C8C8C]" />
                  }
                </div>
                <span className="text-[14px] text-[#8C8C8C]">{option.text}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="border-b border-[#CBD5E1]" />
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Multiple Select {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "TRUE_FALSE":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-[12px]">
            {["True", "False"].map((option) => (
              <label
                key={option}
                className="flex flex-row items-center gap-[8px]"
              >
                {item.answer && option === "True" || !item.answer && option === "False" ? <img src="/assets/icons/dot-circle-solid.svg" alt="" />
                  : <img src="/assets/icons/circle.svg" alt="" />
                }
                <span className="text-[14px] text-[#8C8C8C]">{option}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="border-b border-[#CBD5E1]" />
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              True/False {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "FILL_BLANK":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">{item.questionText.split('_')[0]}<span>{"_".repeat(5)}</span>{item.questionText.split('_')[1]}</h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* display question with answer */}
          <p className="text-[14px] text-[#64748B]">{item.questionText.split('_')[0]}<span className="py-[4px] rounded-[6px] px-[12px] mx-[12px] border bg-[#F3F3F5]">{item.answer}</span>{item.questionText.split('_')[1]}</p>

          {/* Footer */}
          <div className="border-b border-[#CBD5E1]" />
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Fill in the Blank {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "MATCHING":


      // const shuffledRightSideIndex = item.options.rightSide.map((el) => item.answer?.findIndex((pair) => pair.rightSideId === el.id));
      // const shuffledLeftSideIndex = item.answer?.map((pair) => item.options.rightSide.findIndex((item) => item?.id === pair.rightSideId));

      // Called each time any ref mounts

      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>


          {/* Pairs */}
          <RenderMatching item={item} rightSideIndex={shuffledRightSideIndex} leftToRightSideIndex={leftToRightSideIndex} colorShades={colorShades} />

          {/* Divider */}
          <div className="border-b border-[#CBD5E1]" />

          {/* Footer */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Matching {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "SHORT_ANSWER":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder={item.placeholder || "Short answer text"}
            readOnly
            className="border-b border-[#CBD5E1] w-full pb-[4px] text-[14px] text-[#8C8C8C] bg-transparent outline-none"
          />

          {/* Footer */}
          {/* <div className="border-b border-[#CBD5E1]" /> */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              {item.point ?? 0} Point
            </div>
            <p className="text-[12px] text-[#0F172A] font-medium">With Rubric</p>
          </div>
        </div>
      );

    case "ESSAY":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-[24px] items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Textarea */}
          <textarea
            placeholder={item.placeholder || "Type your ESSAY here..."}
            readOnly
            rows={5}
            className="w-full border-b border-[#CBD5E1] bg-transparent text-[#8C8C8C] text-[14px] outline-none resize-none pb-[8px]"
          />

          {/* Footer */}
          {/* <div className="border-b border-[#CBD5E1]" /> */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              {item.point ?? 0} Point
            </div>
            <p className="text-[12px] text-[#0F172A] font-medium">With Rubric</p>
          </div>
        </div>
      );

    case "NUMERICAL_ENTRY":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder={"Write your answer here"}
            readOnly
            className="border-b border-[#CBD5E1] w-full pb-[4px] text-[14px] text-[#8C8C8C] bg-transparent outline-none"
          />

          {/* Footer */}
          {/* <div className="border-b border-[#CBD5E1]" /> */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Numerical Entry {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "ORDERING":

      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Options */}
          <SortableContext
            items={item.options.map((option) => option.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-[12px]">
              {item.options?.map(({ id, text }, i) => (
                <OrderingOption key={id} itemId={item.id} id={id} idx={i} text={text} />
              ))}
            </div>
          </SortableContext>

          {/* Divider */}
          <div className="border-b border-[#CBD5E1]" />

          {/* Footer */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              Ordering {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    case "FILE_UPLOAD":
      return (
        <div className="flex flex-col w-full gap-[24px]">
          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="gap-[24px] flex flex-row items-center">
              <Handle />
              <h2 className="text-[17px] font-medium text-[#0F172A]">
                {item.questionText}
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* File Upload Box */}
          <div className="border flex items-center flex-col border-dashed border-[#CBD5E1] rounded-lg p-[30px] gap-[10px] text-center text-[#8C8C8C] text-[14px] bg-[#F8FAFC]">
            <div className="w-[18px] h-[18px]">
              <img src="/assets/icons/plus-vector.svg" alt="" />
            </div>
            Upload your Signature ( Max size: 5MB )
            <br />
            Allowed File: jpeg, .jpg, .png
          </div>

          {/* Divider */}
          <div className="border-b border-[#CBD5E1]" />

          {/* Footer */}
          <div className="flex flex-row items-center justify-between">
            <div className="bg-[#2563EB] text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              {item.point ?? 0} Point
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col w-full gap-[16px] border border-red-300 bg-red-50 rounded-[8px] p-[16px]">

          {/* Header */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-[16px] items-center">
              <Handle />
              <h2 className="text-[16px] font-semibold text-red-700">
                Unknown Element
              </h2>
            </div>
            <QuickAction id={item.id} />
          </div>

          {/* Error Message */}
          <div className="text-red-600 text-[14px]">
            ⚠️ Unsupported form element type:
            <span className="font-semibold"> {item.type}</span>
          </div>

          {/* Hint */}
          <p className="text-[12px] text-red-500 italic">
            This element type is not recognized. It may be from a newer version or incorrectly added.
          </p>

          {/* Footer */}
          <div className="flex flex-row items-center justify-between pt-[4px]">
            <div className="bg-red-600 text-white text-[10px] font-semibold rounded-full py-[4px] px-[6px]">
              {item.point ?? 0} Point
            </div>
            <p className="text-[12px] text-red-600 font-medium">Error</p>
          </div>
        </div>
      );
  }
}

export default RenderFormElement;
