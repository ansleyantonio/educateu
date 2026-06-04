import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import FilterCourseFrom from "./filterCourseForm";
import { ICertificateFilterForm } from "../../../../_assets/schemas/certificateFilterFormSchema";

interface FilterDataProps {
  setFilterData: (data: ICertificateFilterForm) => void;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
}

const FilterData = ({
  setFilterData,
  setCurrentPage,
  isLoading,
}: FilterDataProps) => {
  return (
    <Accordion type="single" collapsible className="mb-3 w-full">
      <AccordionItem value="item-1">
        <Card className="p-4">
          <AccordionTrigger className="text-lg font-semibold">
            Filter Course List
          </AccordionTrigger>
          <AccordionContent className="px-1 mt-4">
            <FilterCourseFrom
              isLoading={isLoading}
              setFilterData={setFilterData}
              setCurrentPage={setCurrentPage}
            />
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default FilterData;
