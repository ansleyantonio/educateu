/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { useSortable } from "@dnd-kit/sortable";
import { ChevronDown, Clock, FileText, GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import LessonDetails from "@/app/admin/course-management/_assets/components/lessonComponent/lessonDetails";
import UnAssignLessonModal from "./assignable_component/unassign/unAssignLesson";
import AssessmentDetails from "@/app/admin/course-management/_assets/components/lessonComponent/assessmentDetails";
import UnAssignAssessmentModal from "./assignable_component/unassign/unAssignAssessment";
import { Tag } from "antd";

interface ModuleListProps {
  content: any;
  openList: string | null;
  setOpenList: React.Dispatch<React.SetStateAction<string | null>>;
  toggleList: (value: string) => void;
  id: string;
}

const LessonList = ({
  id,
  openList,
  content,
  setOpenList,
}: ModuleListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const moduleValue = `module-${content.id}`;
  const active = openList === moduleValue;

  const handleAccordionClick = () => {
    if (openList === moduleValue) {
      setOpenList(null);
    } else {
      setOpenList(moduleValue);
    }
  };

  return (
    <AccordionItem
      key={content.id}
      value={moduleValue}
      className="mb-2 bg-white rounded-md border-2 border-gray-200"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div
        className={`flex gap-2 rounded-md items-center cursor-not-allowed justify-between w-full px-1 py-3 ${
          active ? "border-b-2 border-b-gray-200" : ""
        } ${content?.title ? "bg-[#FAFAFA]" : "bg-[#a4c7ff]"}`}
      >
        {" "}
        {/* Draggable Section */}
        <div
          {...listeners}
          className="flex flex-1 gap-2 items-center p-2 border-white transition-all duration-200 ease-in-out cursor-grab"
          onClick={handleAccordionClick}
        >
          <div>
            <GripVertical
              strokeWidth={2}
              size={20}
              className="text-muted-foreground"
            />
          </div>

          {/* Module Title */}
          <div className="flex flex-col">
            <p className="flex flex-wrap gap-2 items-center font-medium">
              <span className="text-base font-semibold text-gray-800">
                {content?.title ?? content?.nameOrTitle}
              </span>

              {/* Time/Questions Badge */}
              <span className="inline-flex gap-1 items-center py-1 px-3 text-xs font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200">
                {content?.title ? (
                  <>
                    <Clock className="w-3 h-3" />
                    {content?.estimatedTimeToComplete}{" "}
                    {["DEGREE", "DIPLOMA"].includes(content?.type)
                      ? "Hr"
                      : "Min"}
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    {content?.questionSize} Questions
                  </>
                )}
              </span>

              {/* Category Badge */}
              {content?.assessmentCategory && (
                <span className="inline-flex gap-1 items-center py-1 px-3 text-xs font-medium text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 rounded-full border border-purple-200">
                  {content?.assessmentCategory}
                </span>
              )}
            </p>
            <p className="h-full text-xs text-muted-foreground max-w-[450px] truncate">
              {content?.outcome ?? content?.descriptionOrInstructions}
            </p>
          </div>
        </div>
        {/* Module Icons */}
        <div className="flex gap-5 justify-end items-center mr-2 min-w-[100px]">
          {content?.assessmentCode ? (
            <UnAssignAssessmentModal id={id} assessment={content} />
          ) : (
            <UnAssignLessonModal id={id} lesson={content} />
          )}

          {/* Use AccordionTrigger for proper accordion behavior */}
          <div
            onClick={handleAccordionClick}
            className="rounded-md border cursor-pointer py-[6px] px-[9px]"
          >
            <ChevronDown
              strokeWidth={3}
              size={15}
              className={`text-muted-foreground transition-transform ${
                active ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
      <AccordionContent>
        {content?.assessmentCode ? (
          <AssessmentDetails assessmentId={content} />
        ) : (
          <LessonDetails contents={content?.lessonContents} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default LessonList;
