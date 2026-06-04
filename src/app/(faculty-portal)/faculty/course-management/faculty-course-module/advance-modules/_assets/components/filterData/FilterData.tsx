import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IAdvanceModuleForm } from "../../schemas/moduleSchema";
import FilterAdvanceModuleFrom from "./filterAdvanceCourseForm";

interface FilterDataProps {
  setFilterData: (data: IAdvanceModuleForm) => void;
  setCurrentPage: (page: number) => void;
}

const FilterData = ({ setFilterData, setCurrentPage }: FilterDataProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-3"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <Card className="p-4">
          <AccordionTrigger>Filter Advance Module</AccordionTrigger>
          <AccordionContent className="mt-10 px-1">
            <FilterAdvanceModuleFrom
              setCurrentPage={setCurrentPage}
              setFilterData={setFilterData}
            />
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default FilterData;
