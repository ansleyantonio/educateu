/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IPromotionalCodeFormSchema } from "../../schemas/promotionCode";
import FilterModuleFrom from "./filterModuleCourseForm";

interface FilterDataProps {
  setFilterData: (data: IPromotionalCodeFormSchema) => void;
  setCurrentPage: (page: number) => void;
  FilterItemName?: string;
}

const ModuleFilterData = ({
  FilterItemName = "Filter Module",
  setFilterData,
  setCurrentPage,
}: FilterDataProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="mb-3 w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <Card className="p-4">
          <AccordionTrigger>{FilterItemName}</AccordionTrigger>
          <AccordionContent className="px-1 mt-10">
            <FilterModuleFrom
              setCurrentPage={setCurrentPage}
              setFilterData={setFilterData}
            />
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default ModuleFilterData;
