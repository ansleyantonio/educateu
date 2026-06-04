// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/custom_ui/form";
// import { TextCaseFormat } from "@/utils/textFormate";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// // Extended interface to include phone-specific props
// interface PhoneFieldPropsInterface {
//   form: any;
//   name: string;
//   labelName?: string;
//   defaultCountry?: string;
//   disableCountryCode?: boolean;
//   disableDropdown?: boolean;
//   placeholder?: string;
//   disabled?: boolean;
//   optional?: boolean;
//   customMessage?: string;
//   onValueChange?: (value: any) => void;
//   isLoading?: boolean;
//   viewOnly?: boolean;
// }
// /**
//  * PhoneFieldPropsInterface
//  * Defines the shape of props accepted by the PhoneNumber component.
//  */
// export const PhoneNumber = ({
//   form,
//   name,
//   labelName,
//   disabled = false,
//   optional = true,
//   defaultCountry = "us",
//   disableCountryCode = true,
//   disableDropdown = false,
//   placeholder = "Enter phone number",
//   customMessage,
//   viewOnly = false,
//   onValueChange,
//   isLoading = false,
// }: PhoneFieldPropsInterface) => {
//   return (
//     <FormField
//       control={form.control}
//       name={name}
//       render={({ field }) => {
//         const error = form.formState.errors?.[name];
//         const isError = !!error;

//         return (
//           <FormItem>
//             {labelName && (
//               <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
//                 {TextCaseFormat(labelName)}
//                 {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
//               </label>
//             )}
//             <FormControl>
//               <PhoneInput
//                 containerClass="w-full"
//                 inputClass={`w-full ${isError ? "border-red-600" : ""}`}
//                 inputStyle={{
//                   width: "100%",
//                   padding: "20px 50px",
//                   ...(isError && { borderColor: "#dc2626" }),
//                 }}
//                 country={defaultCountry}
//                 value={field.value}
//                 searchStyle={{ width: "100%" }}
//                 disabled={disabled}
//                 disableCountryCode={disableCountryCode}
//                 disableDropdown={disableDropdown}
//                 placeholder={TextCaseFormat(placeholder)}
//                 onChange={field.onChange}
//                 onBlur={field.onBlur}
//               />
//             </FormControl>
//             <FormMessage>
//               {isError
//                 ? String(error?.message || "")
//                 : // Custom condition-based message (e.g., async validations)
//                   customMessage || ""}
//             </FormMessage>
//           </FormItem>
//         );
//       }}
//     />
//   );
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { maskString } from "@/utils/maskString/maskString";
import { TextCaseFormat } from "@/utils/textFormate";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneFieldPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  defaultCountry?: string;
  disableCountryCode?: boolean;
  disableDropdown?: boolean;
  placeholder?: string;
  disabled?: boolean;
  optional?: boolean;
  customMessage?: string;
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
  viewOnly?: boolean;
  hasPhone?: boolean;
}

export const PhoneNumber = ({
  form,
  name,
  labelName,
  disabled = false,
  optional = true,
  defaultCountry = "us",
  disableCountryCode = true,
  disableDropdown = false,
  placeholder = "Enter phone number",
  customMessage,
  viewOnly = false,
  onValueChange,
  isLoading = false,
  hasPhone = false,
}: PhoneFieldPropsInterface) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        const isError = !!error;

        return (
          <FormItem>
            {labelName && (
              <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                {TextCaseFormat(labelName)}
                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </label>
            )}

            {viewOnly ? (
              <div className="min-h-[40px] px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md">
                {hasPhone ? maskString(field.value) : field.value || ""}
              </div>
            ) : (
              <>
                <FormControl>
                  <PhoneInput
                    containerClass="w-full"
                    inputClass={`w-full ${isError ? "border-red-600" : ""}`}
                    inputStyle={{
                      width: "100%",
                      padding: "20px 50px",
                      ...(isError && { borderColor: "#dc2626" }),
                    }}
                    country={defaultCountry}
                    value={field.value}
                    searchStyle={{ width: "100%" }}
                    disabled={disabled || isLoading}
                    disableCountryCode={disableCountryCode}
                    disableDropdown={disableDropdown}
                    placeholder={TextCaseFormat(placeholder)}
                    onChange={(value) => {
                      field.onChange(value);
                      if (onValueChange) onValueChange(value);
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage>
                  {isError
                    ? String(error?.message || "")
                    : isLoading
                    ? "Checking..."
                    : customMessage || ""}
                </FormMessage>
              </>
            )}
          </FormItem>
        );
      }}
    />
  );
};
