/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UseFormReturn } from "react-hook-form";
import GeneralInformation from "./inputField/generalInformation";
import Accreditation from "./inputField/Accredition";

interface FormType {
  form: UseFormReturn<any>;
  isEdit?: boolean;
}
const Form_field = ({ form, isEdit = false }: FormType) => {
  return (
    <>
      <div className="space-y-6">
        <GeneralInformation form={form} isEdit={isEdit} />
        <Accreditation form={form} isEdit={isEdit} />
        {/* <FinancialInformation form={form} isEdit={isEdit} /> */}
      </div>
    </>
  );
};

export default Form_field;
