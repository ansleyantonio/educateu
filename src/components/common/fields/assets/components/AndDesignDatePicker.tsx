// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/custom_ui/form";
// import dateFormat from "@/utils/DateFormatter";
// import { TextCaseFormat } from "@/utils/textFormate";
// import { DatePicker as AntDatePicker, Space } from "antd";
// import dayjs from "dayjs";
// import { useEffect } from "react";
// import { DatePickerFieldPropsInterface } from "../interface/inputPropsType";

// /**
//  * DatePickerAnd
//  * A reusable Ant Design DatePicker component integrated with react-hook-form.
//  *
//  * Features:
//  * - Supports "future", "previous", "normal", and "current" date selection modes.
//  * - Automatically sets today's date in "current" mode.
//  * - Supports disabled and edit-only modes.
//  * - Handles timezone-safe date storage
//  */

// export const DatePickerAnd = ({
//   form,
//   name,
//   labelName,
//   placeholder,
//   optional = true,
//   isEditMode = false,
//   isDisabled = false,
//   type = "date",
//   mode = "normal",
//   viewOnly = false,
//   defaultDateSelect = false,
//   customMessage,
// }: DatePickerFieldPropsInterface) => {
//   const now = dayjs();

//   /**
//    * getDisabledDate
//    * Disables dates based on the selected mode:
//    * - "future": disables dates after today
//    * - "previous": disables dates before today
//    * - "normal": allows all dates
//    */
//   const getDisabledDate = (current: dayjs.Dayjs) => {
//     if (mode === "future") {
//       return current && current > now.endOf("day");
//     } else if (mode === "previous") {
//       return current && current < now.startOf("day");
//     }
//     return false; // "normal"
//   };

//   const format = dateFormat.getDateFormat(type);

//   /**
//    * Automatically set today's date if mode is "current"
//    * and no initial value is provided.
//    */
//   useEffect(() => {
//     const currentVal = form.getValues(name);
//     if (!currentVal) {
//       if (mode === "current" || defaultDateSelect) {
//         const dateToSet =
//           type === "date"
//             ? now.toDate()
//             : type === "year"
//               ? now.year()
//               : now.format(format);

//         form.setValue(name, dateToSet, { shouldValidate: true });
//       }
//     }
//   }, [mode, form, name, now, type, format, defaultDateSelect]);

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
//             {viewOnly ? (
//               <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-[40px]">
//                 {field.value ? dayjs(field.value).format(format) : ""}
//               </div>
//             ) : (
//               <FormControl>
//                 <div className="!w-full">
//                   <Space direction="vertical" className="w-full">
//                     <AntDatePicker
//                       picker={type}
//                       placeholder={TextCaseFormat(placeholder || "Select Date")}
//                       className="w-full min-h-[40px]"
//                       disabled={isEditMode || isDisabled}
//                       value={
//                         field.value
//                           ? type === "year"
//                             ? dayjs().year(field.value as number)
//                             : dayjs(field.value)
//                           : undefined
//                       }
//                       onChange={(date) => {
//                         if (!date) {
//                           form.setValue(name, undefined, {
//                             shouldValidate: true,
//                             shouldDirty: true,
//                           });
//                           return;
//                         }

//                         let value: any;

//                         switch (type) {
//                           case "date":
//                             // Store as ISO string without timezone conversion
//                             // This prevents one-day shifts due to timezone differences
//                             value = date.format("YYYY-MM-DD");
//                             break;
//                           case "year":
//                             value = date.year();
//                             break;
//                           default:
//                             value = date.format(format);
//                         }

//                         form.setValue(name, value, {
//                           shouldValidate: true,
//                           shouldDirty: true,
//                         });
//                       }}
//                       format={format}
//                       disabledDate={getDisabledDate}
//                     />
//                   </Space>
//                 </div>
//               </FormControl>
//             )}
//             <FormMessage>
//               {isError ? String(error?.message || "") : customMessage || ""}
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
import dateFormat from "@/utils/DateFormatter";
import { TextCaseFormat } from "@/utils/textFormate";
import { DatePicker as AntDatePicker, Space } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { DatePickerFieldPropsInterface } from "../interface/inputPropsType";
/**
 * DatePickerAnd
 * A reusable Ant Design DatePicker component integrated with react-hook-form.
 *
 * Features:
 * - Supports "future", "previous", "normal", and "current" date selection modes.
 * - Automatically sets today's date in "current" mode.
 * - Supports disabled and edit-only modes.
 */

export const DatePickerAnd = ({
  form,
  name,
  labelName,
  placeholder,
  optional = true,
  isEditMode = false,
  isDisabled = false,
  type = "date",
  mode = "normal",
  viewOnly = false,
  defaultDateSelect = false,
  customMessage, //
}: DatePickerFieldPropsInterface) => {
  const now = dayjs();

  /**
   * getDisabledDate
   * Disables dates based on the selected mode:
   * - "future": disables dates after today
   * - "previous": disables dates before today
   * - "normal": allows all dates
   */

  const getDisabledDate = (current: dayjs.Dayjs) => {
    if (mode === "future") {
      return current && current > now.endOf("day");
    } else if (mode === "previous") {
      return current && current < now.startOf("day");
    }
    return false; // "normal"
  };

  // dateUtils.ts
  const format = dateFormat.getDateFormat(type);

  /**
   * Automatically set today's date if mode is "current"
   * and no initial value is provided.
   */

  useEffect(() => {
    const currentVal = form.getValues(name);
    if (!currentVal) {
      if (mode === "current" || defaultDateSelect) {
        form.setValue(
          name,
          type === "date"
            ? now.format(format) // ✅ FIXED
            : type === "year"
            ? now.year()
            : now.format(format),
          { shouldValidate: true }
        );
      }
    }
  }, [mode, form, name, now, type, format, defaultDateSelect]);

  // useEffect(() => {
  //   const currentVal = form.getValues(name);
  //   if (mode === "current" && !currentVal) {
  //     form.setValue(name, now.toDate());
  //   }
  // }, [mode, form, name, now]);

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
              // how view mode like TextArea
              <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-[40px]">
                {/* {field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""} */}
                {field.value ? dayjs(field.value).format(format) : ""}
              </div>
            ) : (
              <FormControl>
                <div className="!w-full">
                  <Space direction="vertical" className="w-full">
                    <AntDatePicker
                      picker={type}
                      placeholder={TextCaseFormat(placeholder || "Select Date")}
                      className="w-full min-h-[40px]"
                      disabled={isEditMode || isDisabled}
                      value={
                        field.value
                          ? type === "year"
                            ? dayjs().year(field.value as number)
                            : dayjs(field.value)
                          : undefined
                      }
                      onChange={(date) => {
                        if (!date) {
                          form.setValue(name, undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          return;
                        }
                        let value: any;

                        switch (type) {
                          case "date":
                            value = new Date(date.format(format)); // ✅ YYYY-MM-DD string
                            // value = date.toDate(); // full Date
                            break;
                          case "year":
                            value = date.year(); // number
                            break;
                          default:
                            value = date.format(format); // string
                        }

                        form.setValue(name, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      format={format}
                      disabledDate={getDisabledDate}
                    />
                    {/* onChange={(date) => */}
                    {/*   form.setValue( */}
                    {/*     name, */}
                    {/*     date ? dayjs(date).toDate() : undefined, */}
                    {/*     { shouldValidate: true, shouldDirty: true }, //  trigger validation instantly */}
                    {/*   ) */}
                    {/* } */}
                    {/* format="YYYY-MM-DD" */}
                  </Space>
                </div>
              </FormControl>
            )}
            {/* <FormMessage /> */}
            <FormMessage>
              {isError ? String(error?.message || "") : customMessage || ""}
            </FormMessage>
          </FormItem>
        );
      }}
    />
  );
};
