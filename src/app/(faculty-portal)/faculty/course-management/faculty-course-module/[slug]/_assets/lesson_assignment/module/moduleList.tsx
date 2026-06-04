/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { useSortable } from "@dnd-kit/sortable";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import ModuleDetails from "./moduleDetails";

interface ModuleListProps {
  modules: any;
  openModule: string | null;
  setOpenModule: React.Dispatch<React.SetStateAction<string | null>>;
  toggleModule: (value: string) => void;
}

const ModuleList = ({
  openModule,
  modules,
  setOpenModule,
}: ModuleListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: modules.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const moduleValue = `module-${modules.id}`;
  const active = openModule === moduleValue;

  const handleAccordionClick = () => {
    if (openModule === moduleValue) {
      setOpenModule(null);
    } else {
      setOpenModule(moduleValue);
    }
  };

  return (
    <AccordionItem
      key={modules.id}
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
            <p className="font-medium">{modules?.name}</p>
            <p className="text-xs text-muted-foreground">
              {modules?.description}
            </p>
          </div>
        </div>

        {/* Module Icons */}
        <div className="flex gap-5 justify-end items-center mr-2 min-w-[100px]">
          <div
            onClick={(e) => {
              e.stopPropagation();
              console.log("Delete clicked");
            }}
            className="rounded-md border cursor-pointer hover:bg-gray-100 py-[6px] px-[9px]"
          >
            <Trash2
              strokeWidth={2}
              className="text-muted-foreground"
              size={15}
            />
          </div>

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

      <AccordionContent className="pl-6">
        <ModuleDetails modules={modules} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModuleList;
