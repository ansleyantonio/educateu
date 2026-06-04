import { updateRoleFormProps } from "../../interface/update_role_type";

const UpdateRoleForm = ({ form, data, activeRole }: updateRoleFormProps) => {
  console.log("Form Data:", data, form);
  return (
    <div>
      <h1>Update Role Form</h1>
    </div>
  );
};
export default UpdateRoleForm;
