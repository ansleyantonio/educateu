/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { CustomField } from "../../fields/cusInputField";

const Personal_statement_step_4 = ({ viewOnly = false, form }: any) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  viewOnly = viewOnly || !hasPostAndDeletePermission;

  return (
    <div>
      <div className="w-full">
        <CustomField.TextArea
          form={form}
          name="personalStatement.statement"
          labelName="Personal Statement"
          viewOnly={viewOnly}
          placeholder="Personal Statement"
        />
      </div>
    </div>
  );
};

export default Personal_statement_step_4;
