/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export const PhoneNumberField = ({
  disabled,
  control,
  name,
  label,
  defaultCountry = "us", // You can change this to your preferred default
}: any) => {
  // console.log("sss", options);
  return (
    <div className="space-y-1 w-full">
      <label className="cusFormLabel">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <PhoneInput
            containerClass="w-full"
            inputClass="W-full"
            inputStyle={{ width: "100%", padding: "20px 50px" }}
            // country={"us"}
            country={defaultCountry}
            value={field.value}
            searchStyle={true ? { width: "100%" } : {}} // Conditionally apply style
            disabled={disabled}
            //   onChange={phone => this.setState({ phone })}
            disableCountryCode={true} // Makes country code non-editable
            disableDropdown={false} // Keeps dropdown enabled for country selection
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
};
