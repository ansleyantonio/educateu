/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const Next_of_kin_step_6 = ({ form }: any) => {
  const nextOfKin = form.watch("nextOfKin.relationship");
  // if sex value is  MALE or FEMALE then otherSex value "" set
  if (nextOfKin !== "other") {
    form.setValue("nextOfKin.otherRelationship", "");
  }
  return (
    <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5 lg:grid-cols-2">
      <CustomField.SelectField
        form={form}
        name="nextOfKin.relationship"
        labelName="Relationship"
        placeholder="Relationship"
        options={[
          { value: "none", label: "(None)" },
          { value: "family", label: "Family" },
          { value: "friend", label: "Friend" },
          { value: "colleague", label: "Colleague" },
          { value: "other", label: "Other" },
        ]}
      />

      {nextOfKin === "other" && (
        <CustomField.Text
          form={form}
          name="nextOfKin.otherRelationship"
          labelName="Relationship(Other)"
          optional={true}
          placeholder="Other Relationship"
        />
      )}
      {/* <FormField
        control={form.control}
        name="nextOfKin.relationship"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">Relationship </label>
            <Select
              onValueChange={field.onChange}
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">(None)</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="colleague">Colleague</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      /> */}
      <CustomField.Text
        form={form}
        name="nextOfKin.fullName"
        labelName="Full Name"
        optional={true}
        placeholder="Full Name"
      />

      <CustomField.PhoneNumber
        form={form}
        name="nextOfKin.phoneOrMobile"
        labelName="Phone/Mobile"
        optional={true}
        placeholder="Phone/Mobile"
      />
      <CustomField.Text
        form={form}
        name="nextOfKin.address"
        labelName="Address"
        optional={true}
        placeholder="Address"
      />
    </div>
  );
};

export default Next_of_kin_step_6;
