/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Accreditation from "./inputField/Accredition";
import GeneralInformation from "./inputField/generalInformation";
interface IFormType {
  form: any;
  isEdit?: boolean;
}

const Form_field = ({ form, isEdit = false }: IFormType) => {
  return (
    <>
      <div className="space-y-6">
        <GeneralInformation isEdit={isEdit} form={form} />
        <Accreditation form={form} isEdit={isEdit} />
        {/* <FinancialInformation form={form} isEdit={isEdit} /> */}
      </div>
    </>
  );
};

export default Form_field;
