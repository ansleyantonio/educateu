/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { useSortable } from "@dnd-kit/sortable";
import { ChevronDown, GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import UnassignModuleModal from "./unassignModuleDialog";
import { IAssignedModule } from "../../../../types/assigned_module";
import LessonList from "../../../../../../_assets/components/lessonComponent/lissonList";

interface ModuleListProps {
  module: IAssignedModule;
  openList: string | null;
  setOpenList: React.Dispatch<React.SetStateAction<string | null>>;
  toggleList: (value: string) => void;
  id: string;
}

const ModuleList = ({ id, openList, module, setOpenList }: ModuleListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module?.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const moduleValue = `module-${module?.id}`;
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
      key={module?.id}
      value={moduleValue}
      className="mb-2 bg-white rounded-md border-2 border-gray-200"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div
        className={`flex gap-2 items-center cursor-not-allowed justify-between w-full px-1 py-3 ${
          active ? "border-b-2 border-b-gray-200 bg-[#FAFAFA]" : ""
        }`}
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
            <p className="font-medium">
              {module?.title}{" "}
              {module?.credit > 0 && (
                <span className="px-2 ml-2 text-xs text-blue-500 bg-blue-100 rounded-xl">
                  {module?.credit} Credits
                  {/* {["DEGREE", "DIPLOMA"].includes(module?.courseType) */}
                  {/*   ? "Hr" */}
                  {/*   : "Min"} */}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground max-w-[370px] truncate">
              {module?.description}
            </p>
          </div>
        </div>
        {/* Module Icons */}
        <div className="flex gap-5 justify-end items-center mr-2 min-w-[100px]">
          <UnassignModuleModal id={id} module={module} />

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
        <LessonList moduleLessons={module?.moduleLessons} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModuleList;
