/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import { assessmentCategoryOptions, assessmentTypeOptions } from "../utils/constants";

interface FormType {
    form: any;
    viewOnly?: boolean;
}

const FilterFormField = ({ form, viewOnly }: FormType) => {
    const isViewOnly = viewOnly;

    return (
        <>
            <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-2">


                <CustomField.SelectField
                    form={form}
                    name="assessmentCategory"
                    labelName="Assessment Category"
                    placeholder="Assessment Category"
                    options={assessmentCategoryOptions}
                    optional={false}
                    viewOnly={isViewOnly}
                />

                <CustomField.SelectField
                    form={form}
                    name="assessmentType"
                    labelName="Assessment Type"
                    placeholder="Assessment Type"
                    options={assessmentTypeOptions}
                    optional={false}
                    viewOnly={isViewOnly}
                />
                <CustomField.Text
                    form={form}
                    name="assessmentCode"
                    labelName="Assessment Code"
                    placeholder="Assessment Code"
                    optional={false}
                    viewOnly={isViewOnly}
                />

                <CustomField.Number
                    form={form}
                    name="timeLimit"
                    labelName="Estimated Time To complete (Minute) "
                    placeholder="Enter Time limit"
                    viewOnly={isViewOnly}

                />
            </div>
        </>
    );
};

export default FilterFormField;
