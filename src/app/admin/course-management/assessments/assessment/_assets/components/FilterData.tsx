/* eslint-disable no-unused-vars */
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { IFilterAssessmentForm } from "../schemas/schema";
import FilterAssessmentForm from "./filterAssessmentForm";

interface FilterDataProps {
    setFilterData: (data: IFilterAssessmentForm) => void;
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
                    <AccordionTrigger>Filter Assessment</AccordionTrigger>
                    <AccordionContent className="px-1 mt-10">
                        <FilterAssessmentForm
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

export default FilterData;
