/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

import onFormError from "@/utils/formError";
import { AssessmentSchema, IFilterAssessmentForm } from "../schemas/schema";
import { FilterAssessmentDefaultValue } from "../utils/FilterAssessmentDefaultValue";
import FilterFormField from "./FilterFormField";

const FilterAssessmentForm = ({
    isLoading,
    setFilterData,
    setCurrentPage,
}: {
    isLoading: boolean;
    setFilterData: any;
    setCurrentPage: (page: number) => void;
}) => {
    const form = useForm<IFilterAssessmentForm>({
        resolver: zodResolver(AssessmentSchema.filter),
        defaultValues: FilterAssessmentDefaultValue(),
        mode: "onChange",
    });

    //. Define a submit handler.
    function onSubmit(values: IFilterAssessmentForm) {
        if (values.timeLimit == 0) {
            delete values.timeLimit;
        }
        setFilterData(values);
        setCurrentPage(1);
    }

    const handelResetForm = () => {
        form.reset({});
        setFilterData({});
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onFormError)}
                className="space-y-4"
            >
                <div className="">
                    <FilterFormField form={form} />
                </div>

                {/* login button  */}
                <div className="flex gap-x-3 justify-end items-center">
                    <ActionButton
                        handleOpen={() => handelResetForm()}
                        type="button"
                        variant="icon"
                        tooltipContent="Reset"
                        icon={<RefreshCw />}
                    />
                    <ActionButton
                        isPending={isLoading}
                        type="submit"
                        buttonContent="Apply Filter"
                        handleOpen={() => form.handleSubmit(onSubmit)}
                    />
                </div>
            </form>
        </Form>
    );
};

export default FilterAssessmentForm;
