/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IAdvanceCourseFilterForm } from "../../../schemas/advanceFilterFormSchema";
import FilterCourseFrom from "./filterCourseForm";

interface FilterDataProps {
  setFilterData: (data: IAdvanceCourseFilterForm) => void;
  setCurrentPage: (page: number) => void;
  FilterItemName?: string;
}

const CourseFilterData = ({
  setFilterData,
  setCurrentPage,
  FilterItemName,
}: FilterDataProps) => {
  return (
    <Accordion type="single" collapsible className="mb-3 w-full">
      <AccordionItem value="item-1">
        <Card className="p-4">
          <AccordionTrigger className="text-lg font-semibold capitalize">
            {FilterItemName}
          </AccordionTrigger>
          <AccordionContent className="px-1 mt-4">
            <FilterCourseFrom
              courseType={FilterItemName}
              setFilterData={setFilterData}
              setCurrentPage={setCurrentPage}
            />
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default CourseFilterData;
