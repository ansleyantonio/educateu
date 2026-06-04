/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IFilterSessionForm } from "../../schemas/FilterSessionSchema";
import FilterSessionFrom from "./filterSessionForm";

interface FilterDataProps {
  isLoading: boolean;
  setFilterData: (data: IFilterSessionForm) => void;
  setCurrentPage: (page: number) => void;
}

const SessionFilterData = ({
  isLoading,
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
          <AccordionTrigger className="text-lg font-semibold">
            Filter Session
          </AccordionTrigger>
          <AccordionContent className="px-1 mt-10">
            <FilterSessionFrom
              isLoading={isLoading}
              setCurrentPage={setCurrentPage}
              setFilterData={setFilterData}
            />
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
};

export default SessionFilterData;
