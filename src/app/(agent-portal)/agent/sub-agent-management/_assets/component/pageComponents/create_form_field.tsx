/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  control: any;
}

const CreateFormField = ({ form }: { form: FormType }) => {
  // const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <CustomField.Text
        form={form}
        name="firstName"
        labelName="first Name"
        optional={false}
        placeholder="first Name"
      />
      <CustomField.Text
        form={form}
        name="lastName"
        labelName="Last Name"
        placeholder="Last Name"
      />
      <CustomField.Text
        form={form}
        name="username"
        labelName="username"
        placeholder="username"
        optional={false}
      />

      {/* <CustomField.Text
        form={form}
        name="companyName"
        labelName="companyName"
        placeholder="companyName"
      /> */}

      <CustomField.Text
        form={form}
        name="internalReference"
        labelName="internal Reference"
        placeholder="internal Reference"
        disabled={true}
      />

      <CustomField.Text
        form={form}
        name="email"
        labelName="email"
        placeholder="email"
        optional={false}
      />

      <CustomField.PhoneNumber
        form={form}
        name="mobile"
        labelName="mobile Number"
        placeholder="mobile Number"
        optional={false}
      />

      <CustomField.SingleSelectField
        form={form}
        name="userStatus"
        labelName="Status"
        placeholder="select status"
        defaultValue={"ACTIVE"}
        options={["ACTIVE", "PENDING"]}
      />

      {/* Role */}
      {/* <FormField */}
      {/*   control={form.control} */}
      {/*   name="role" */}
      {/*   render={({ field }) => ( */}
      {/*     <FormItem> */}
      {/*       <label className="cusFormLabel">Role (Required)</label> */}
      {/*       <FormControl> */}
      {/*         <Select */}
      {/*           disabled */}
      {/*           onValueChange={field.onChange} */}
      {/*           value={field.value} */}
      {/*         > */}
      {/*           <SelectTrigger> */}
      {/*             <SelectValue placeholder="Select role" /> */}
      {/*           </SelectTrigger> */}
      {/*           <SelectContent> */}
      {/*             <SelectItem value="sub-agent">Sub Agent</SelectItem> */}
      {/*           </SelectContent> */}
      {/*         </Select> */}
      {/*       </FormControl> */}
      {/*       <FormMessage /> */}
      {/*     </FormItem> */}
      {/*   )} */}
      {/* /> */}

      {/* Reporting Agent ID */}
      {/* <FormField */}
      {/*   control={form.control} */}
      {/*   name="reportingTo" */}
      {/*   render={({ field }) => ( */}
      {/*     <FormItem> */}
      {/*       <label className="cusFormLabel">Reporting to (Required)</label> */}
      {/*       <FormControl> */}
      {/*         <Select */}
      {/*           disabled */}
      {/*           onValueChange={field.onChange} */}
      {/*           defaultValue={field.value} */}
      {/*         > */}
      {/*           <SelectTrigger> */}
      {/*             <SelectValue placeholder="Select reporting person" /> */}
      {/*           </SelectTrigger> */}
      {/*           <SelectContent> */}
      {/*             <SelectItem value={`${agentRole}`}>{agentName}</SelectItem> */}
      {/*           </SelectContent> */}
      {/*         </Select> */}
      {/*       </FormControl> */}
      {/*       <FormMessage /> */}
      {/*     </FormItem> */}
      {/*   )} */}
      {/* /> */}

      <CustomField.Text
        form={form}
        name="address"
        labelName="address"
        placeholder="address"
        optional={false}
      />

      <CustomField.Password
        form={form}
        name="password"
        labelName="password"
        placeholder="password"
        optional={false}
        mode="validate"
      />
    </>
  );
};

export default CreateFormField;
