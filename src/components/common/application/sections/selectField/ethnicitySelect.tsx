/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import type { ConfigProviderProps } from "antd";
import { Select } from "antd";
import { useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Dropdown option
interface OptionType {
  label: string;
  value: string | number | boolean;
  image?: string;
  disabled?: boolean;
}

interface GroupOption {
  label: string;
  options: OptionType[];
}

type SizeType = ConfigProviderProps["componentSize"];

interface SelectFieldProps<T extends FieldValues> {
  form?: UseFormReturn<T> | any;
  name: Path<T>;
  placeholder: string;
  labelName?: string;
  options?: (OptionType | GroupOption)[];
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  showSearch?: boolean;
  type?: "single" | "multiple";
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
  onSearch?: (value: string) => void;
}

export const EthnicitySelect = <T extends FieldValues>({
  form,
  name,
  labelName,
  optional = true,
  disabled = false,
  options = [],
  placeholder = "Select an option",
  showSearch = true,
  type = "single",
  viewOnly = false,
  onValueChange,
  isLoading = false,
  onSearch,
}: SelectFieldProps<T>) => {
  const [size] = useState<SizeType>("middle");

  let transformedOptions: (OptionType | GroupOption)[] = options;

  if (isLoading) {
    transformedOptions = [
      { label: "Loading...", value: "loading", disabled: true } as OptionType,
    ];
  } else if (options.length === 0) {
    transformedOptions = [
      {
        label: "No options available",
        value: "no-options",
        disabled: true,
      } as OptionType,
    ];
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        const isError = !!error;

        const selectedValue = field.value;
        const selectedOption = (() => {
          for (const opt of transformedOptions) {
            if ("options" in opt) {
              const found = opt.options.find((c) => c.value === selectedValue);
              if (found) return found;
            } else if (opt.value === selectedValue) {
              return opt;
            }
          }
          return undefined;
        })();

        const displayValue = selectedOption?.label || "-";

        return (
          <FormItem>
            {labelName && (
              <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                {TextCaseFormat(labelName)}
                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </label>
            )}

            {viewOnly ? (
              <div className="flex items-center px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-[40px]">
                <p>{displayValue}</p>
              </div>
            ) : (
              <>
                <FormControl>
                  <Select
                    size={size}
                    showSearch={showSearch}
                    onSearch={onSearch}
                    style={{ width: "100%", minHeight: "40px" }}
                    mode={type === "multiple" ? "multiple" : undefined}
                    placeholder={TextCaseFormat(placeholder)}
                    value={field.value || undefined}
                    onChange={(value) => {
                      field.onChange(value);
                      if (onValueChange) onValueChange(value);
                    }}
                    onBlur={field.onBlur}
                    options={transformedOptions as any}
                    disabled={disabled}
                    status={isError ? "error" : undefined}
                    className="custom-disabled-select"
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    getPopupContainer={(node) => node.parentNode as HTMLElement}
                  />
                </FormControl>
                <FormMessage />
              </>
            )}
          </FormItem>
        );
      }}
    />
  );
};
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/custom_ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const data = [
//   {
//     title: "White",
//     disabled: true,
//     children: [
//       { title: "White_British", value: "white_british" },
//       { title: "White_Irish", value: "white_irish" },
//       { title: "White_Other", value: "white_other" },
//     ],
//   },
//   {
//     title: "Mixed / Multiple Ethnic Groups",
//     disabled: true,
//     children: [
//       {
//         title: "Mixed_White and Black Caribbean",
//         value: "mixed_white_black_caribbean",
//       },
//       {
//         title: "Mixed_White and Black African",
//         value: "mixed_white_black_african",
//       },
//       { title: "Mixed_White and Asian", value: "mixed_white_asian" },
//       { title: "Mixed_Other", value: "mixed_other" },
//     ],
//   },
//   {
//     title: "Asian / Asian British",
//     disabled: true,
//     children: [
//       { title: "Asian_Indian", value: "asian_indian" },
//       { title: "Asian_Pakistani", value: "asian_pakistani" },
//       { title: "Asian_Bangladeshi", value: "asian_bangladeshi" },
//       { title: "Asian_Chinese", value: "asian_chinese" },
//       { title: "Asian_Other", value: "asian_other" },
//     ],
//   },
//   {
//     title: "Black / African / Caribbean / Black British",
//     disabled: true,
//     children: [
//       { title: "Black_African", value: "black_african" },
//       { title: "Black_Caribbean", value: "black_caribbean" },
//       { title: "Black_Other", value: "black_other" },
//     ],
//   },
//   {
//     title: "Other Ethnic Group",
//     disabled: true,
//     children: [
//       { title: "Arab", value: "arab" },
//       { title: "Any other ethnic group", value: "any_other_ethnic" },
//     ],
//   },
//   {
//     title: "Prefer not to say",
//     children: [{ title: "Prefer not to say", value: "prefer_not_to_say" }],
//   },
// ];

// export const EthnicitySelect = ({
//   form,
//   disabled = false,
//   name = "personalInformation.ethnicity",
// }: {
//   form: any;
//   disabled?: boolean;
//   name?: string;
// }) => {
//   return (
//     <FormField
//       control={form.control}
//       // name="personalInformation.ethnicity"
//       name={name}
//       render={({ field }) => (
//         <FormItem>
//           <label className="cusFormLabel">
//             Ethnicity
//             <span className="text-[#7E8C9A]">&nbsp;*</span>
//           </label>
//           <Select
//             disabled={disabled}
//             onValueChange={field.onChange}
//             defaultValue={field.value}
//             value={field.value}
//           >
//             <FormControl>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select ethnicity" />
//               </SelectTrigger>
//             </FormControl>

//             <SelectContent>
//               {data.map((group) => (
//                 <div key={group.title}>
//                   {/* Group label */}
//                   <div className="py-1 px-3 text-xs font-medium text-muted-foreground">
//                     {group.title}
//                   </div>
//                   {/* Group options */}
//                   <div className="py-2 px-5">
//                     {group.children.map((item) => (
//                       <SelectItem key={item.value} value={item.value}>
//                         {item.title}
//                       </SelectItem>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </SelectContent>
//           </Select>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// };

// export default EthnicitySelect;
