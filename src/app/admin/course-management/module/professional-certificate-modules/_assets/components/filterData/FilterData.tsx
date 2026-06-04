/* eslint-disable no-unused-vars */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import FilterProfessionalCertificateModuleFrom from "./filterProfessionalCertificateForm";
import { IFilterProfCertModuleForm } from "../../schemas/moduleSchema";

interface FilterDataProps {
  setFilterData: (data: IFilterProfCertModuleForm) => void;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
}

const FilterData = ({
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
          <AccordionTrigger>Filter Professional Module</AccordionTrigger>
          <AccordionContent className="px-1 mt-10">
            <FilterProfessionalCertificateModuleFrom
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
