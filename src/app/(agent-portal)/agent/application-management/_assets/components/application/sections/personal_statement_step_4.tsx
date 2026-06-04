/* eslint-disable @typescript-eslint/no-explicit-any */

import { CustomField } from "@/components/common/fields/cusInputField";

const Personal_statement_step_4 = ({ form }: any) => {
  return (
    <div>
      <div className="w-full">
        <CustomField.TextArea
          form={form}
          name="personalStatement.statement"
          labelName="Personal Statement"
          placeholder="Personal Statement"
        />
      </div>
    </div>
  );
};

export default Personal_statement_step_4;
