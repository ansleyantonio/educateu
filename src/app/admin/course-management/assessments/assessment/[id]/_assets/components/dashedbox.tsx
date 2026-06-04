import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useRef, useState } from "react";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import { FormElement, FormElementType } from "../schemas/formBuilderSchemas";
import RenderFormElement from "./renderFormElement";
import { useUpdateAssignmentQuestion, useUpdateQuizQuestion } from "../hooks/assessment";
import { getDefaultElement } from "../utils/formBuilderDefaults";

interface DashedBoxProps {
  item: FormElement;
  selected?: boolean;
}

export default function DashedBox({ item, selected }: DashedBoxProps) {
  console.log("item", item);
  const contentRef = useRef<HTMLDivElement>(null);
  const setItem = useFormBuilderStore((state) => state.setItem);
  const [height, setHeight] = useState(60); // default height
  const updateQuizQuestion = useUpdateQuizQuestion();
  const updateAssignmentQuestion = useUpdateAssignmentQuestion();
  const assessment = useFormBuilderStore((state) => state.assessment);
  const defaltElement = { ...getDefaultElement(item.type), id: item.id };
  const getIndex = useFormBuilderStore((state) => state.getIndex);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: {
      panel: "middle",
      index: getIndex(item.id),
    }
  });



  useEffect(() => {
    if (!("questionText" in item)) {
      if (assessment?.assessmentCategory === "QUIZ") {
        updateQuizQuestion.mutate(
          defaltElement, {
          onSuccess: (data) => {
            console.log(data);
            setItem(data.data.quizQuestion);
          },
          onError: () => {
            console.log("Failed to update question");
            // showToast("error", "Failed to update question");
          }
        }
        )
      } else {
        updateAssignmentQuestion.mutate(
          defaltElement, {
          onSuccess: (data) => {
            console.log(data);
            setItem({ id: data.data.assignmentQuestion.id, rubricName: data.data.assignmentQuestion.rubricName, rubricDescription: data.data.assignmentQuestion.rubricDescription, type: data.data.assignmentQuestion.submissionType.type, questionText: data.data.assignmentQuestion.questionText, submissionType: data.data.assignmentQuestion.submissionType, point: data.data.assignmentQuestion.point });
          },
          onError: () => {
            console.log("Failed to update question");
            // showToast("error", "Failed to update question");
          }
        }
        )
      }
    };
  }, [item]);


  const selectItem = useFormBuilderStore((state) => state.selectItem);

  useEffect(() => {
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight; // padding compensation
      setHeight(newHeight);
    }
  }, [item]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!("questionText" in item)) {
    return <>Loading</>;
  }

  return (
    <div
      style={style}
      ref={setNodeRef}
      onClick={() => selectItem(item.id)} className="hover:cursor-pointer px-[24px] py-[4px]" >
      <svg
        width="100%" height={height} className={`rounded-[6px] ${selected && "bg-[#F8FAFC]"} overflow-visible`}>
        <rect
          x="1"
          y="1"
          width="100%"
          height={height - 2}
          rx="6"
          fill="none"
          stroke={selected ? "#3B82F6" : "#D9D9D9"}
          strokeWidth="2"
          strokeDasharray={selected ? "10 10" : undefined}
        />
        <foreignObject x="0" y="0" width="100%" height={height}>
          <div
            ref={contentRef}
            className="flex flex-col gap-2 items-center justify-between p-[24px] h-fit"
          >
            <RenderFormElement
              transform={transform} transition={transition} isDragging={isDragging} listeners={listeners} attributes={attributes} item={item}
            />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}


interface DashedBoxMockupProps {
  item?: FormElement | null;
  selected?: boolean;
}
export function DashedBoxMockup({ item, selected }: DashedBoxMockupProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(60); // default height


  useEffect(() => {
    if (contentRef.current) {
      const newHeight = contentRef.current.scrollHeight; // padding compensation
      setHeight(newHeight);
    }
  }, [item]);

  return (
    <div
      className="hover:cursor-pointer p-[24px]" >
      <svg
        width="100%" height={height} className={`rounded-[6px] bg-white overflow-visible`}>
        <rect
          x="1"
          y="1"
          width="100%"
          height={height - 2}
          rx="6"
          fill="none"
          stroke={selected ? "#3B82F6" : "#D9D9D9"}
          strokeWidth="2"
          strokeDasharray={selected ? "10 10" : undefined}
        />
        <foreignObject x="0" y="0" width="100%" height={height}>
          <div
            ref={contentRef}
            className="flex flex-col gap-2 items-center justify-between p-[24px] h-fit"
          >
            {item && <RenderFormElement item={item} />}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}


