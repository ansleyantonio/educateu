/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IFilterDataType } from "../../schemas/scheme";
import FilterDegreeEnrollmentFrom from "./filterDegreeEnrollmentDataForm";

interface FilterDataProps {
  setFilterData: (data: IFilterDataType) => void;
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
          <AccordionTrigger>Diploma Enrollment </AccordionTrigger>
          <AccordionContent className="mt-10 px-1">
            <FilterDegreeEnrollmentFrom
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
