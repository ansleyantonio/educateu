/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { ChevronDown } from "lucide-react";
import AssignableSemesterModuleComponent from "./assignableModule/assignToSemester";
import AssignedModuleComponent from "./assignedModule/module_assignments";

interface SemesterListProps {
  semester: any;
  openModule: string | null;
  setOpenModule: React.Dispatch<React.SetStateAction<string | null>>;
  id: string;
  semesterNo: number;
}

const SemesterList = ({
  id,
  semester,
  openModule,
  setOpenModule,
  semesterNo,
}: SemesterListProps) => {
  const moduleValue = `semesterNumber-${semesterNo}`;
  const active = openModule === moduleValue;

  // Collapse and Expand Function */}
  const handleAccordionClick = () => {
    if (active) {
      setOpenModule(null);
    } else {
      setOpenModule(moduleValue);
    }
  };

  return (
    <AccordionItem
      key={semesterNo}
      value={moduleValue}
      className="mb-2 bg-white rounded-md border-2 border-gray-200"
    >
      {/* Accordion Toggle (Chevron) */}
      <div
        onClick={handleAccordionClick}
        className={`flex gap-2 items-center cursor-pointer justify-between w-full p-3 ${
          active ? "border-b-2 border-b-gray-200" : ""
        }`}
      >
        {/* Title and Description */}
        <div>
          <h1 className="text-lg font-semibold">Semester {semesterNo}</h1>
        </div>

        {/* Semester Management Buttons */}
        <ChevronDown
          strokeWidth={3}
          size={18}
          className={`text-muted-foreground transition-transform duration-200 ${
            active ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Module Details */}
      <AccordionContent className="pt-2">
        {semester ? (
          <AssignedModuleComponent id={id} module={semester?.modules} />
        ) : (
          <div className="flex justify-center items-center h-44">
            <div className="text-center">
              <div className="mb-2 text-gray-400">📦</div>
              <div className="text-gray-500">No modules assigned yet</div>
            </div>
          </div>
        )}

        {/* Assignable Modules */}
        <div className="text-center">
          <AssignableSemesterModuleComponent
            semesterNo={semesterNo as number}
            id={id}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SemesterList;
