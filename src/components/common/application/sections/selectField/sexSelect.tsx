/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { useEffect, useState } from "react";

// const SexSelect = ({ form }: { form: any }) => {
//   const [showOtherInput, setShowOtherInput] = useState(false);
//   const [otherInputOption, setOtherInputOption] = useState("");

//   useEffect(() => {
//     // Show custom input if "OTHER" is selected by default (edit form case)
//     const selectedSex = form.watch("personalInformation.sex");
//     if (selectedSex === "OTHER") {
//       setShowOtherInput(true);
//     }
//   }, [form]);

//   return (
//     <>
//       <FormField
//         control={form.control}
//         name="personalInformation.sex"
//         render={({ field }) => (
//           <FormItem>
//             <label className="cusFormLabel">Sex</label>
//             <Select
//               onValueChange={(value) => {
//                 field.onChange(value);
//                 setShowOtherInput(value === "OTHER");

//                 // Reset custom input if not "Other"
//                 if (value !== "OTHER") {
//                   form.setValue("personalInformation.sexOther", "");
//                 }
//               }}
//               value={field.value}
//             >
//               <FormControl>
//                 {/* <SelectTrigger> */}
//                 <SelectValue placeholder="Select sex" />
//                 {/* </SelectTrigger> */}
//               </FormControl>
//               <SelectContent>
//                 <div>
//                   <SelectItem
//                     onClick={() => setOtherInputOption("MALE")}
//                     value="MALE"
//                   >
//                     Male
//                   </SelectItem>
//                   <SelectItem value="FEMALE">Female</SelectItem>
//                   <SelectItem value="OTHER">Other</SelectItem>
//                   <div>
//                     {showOtherInput && (
//                       <FormField
//                         control={form.control}
//                         name="personalInformation.sexOther"
//                         render={({ field }) => (
//                           <FormItem className="mt-2">
//                             <label className="cusFormLabel">
//                               Please specify
//                             </label>
//                             <FormControl>
//                               <Input
//                                 placeholder="Enter custom gender"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </>
//   );
// };

// export default SexSelect;

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const SexSelect = ({
  form,
  disabled = false,
  onSexChange
}: {
  form: any;
  disabled?: boolean;
  onSexChange?: (val: string) => void;
}) => {
  // Only true while we deliberately keep the dropdown open for “Other”
  const [forceOpen, setForceOpen] = useState(false);

  // Current field value from react-hook-form
  const sex = form.watch("personalInformation.sex");

  // A value counts as “custom” if it isn’t one of the two fixed choices
  const isCustom = sex && !["MALE", "FEMALE"].includes(sex);

  // console.log("sex", sex);

  // ──────────────────────────────────────────
  // Handle option selection
  // ──────────────────────────────────────────
  const handleValueChange = (val: string) => {
    if (val === "OTHER") {
      // 1) Keep the menu open
      setForceOpen(true);
      // 2) Store sentinel so we can detect “custom” on next render
      form.setValue("personalInformation.sex", "OTHER");
      onSexChange?.("OTHER");
    } else if (val === "MALE" || val === "FEMALE") {
      setForceOpen(false);
      form.setValue("personalInformation.sex", val);
      form.setValue("personalInformation.sexCustom", "");
      onSexChange?.(val);
    } else {
      form.setValue("personalInformation.sex", val);
      form.setValue("personalInformation.sexCustom", "");
      onSexChange?.(val);
    }
  };

  return (
    <FormField
      control={form.control}
      name="personalInformation.sex"
      render={({ field }) => (
        <FormItem>
          <label className="cusFormLabel">Sex</label>

          <Select
            /*     ▼ Uncontrolled normally; controlled only while force‑open */
            open={forceOpen ? true : undefined}
            onOpenChange={setForceOpen}
            // value={isCustom ? "OTHER" : field.value}
            onValueChange={handleValueChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>

              {/* prevent auto‑close when “Other” is clicked */}
              <SelectItem value="OTHER" onMouseDown={(e) => e.preventDefault()}>
                Other
              </SelectItem>

              {/* custom input row: show while custom OR forced open */}
              {/* {isCustom && (
                <div
                  className="py-2 px-3"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <FormField
                    control={form.control}
                    name="personalInformation.sex"
                    render={({ field: custom }) => (
                      <FormItem>
                        <label className="cusFormLabel">Please specify</label>
                        <FormControl>
                          <Input
                            autoFocus
                            placeholder="Enter custom gender"
                            value={
                              custom.value === "OTHER" ||
                              custom.value === "MALE" ||
                              custom.value === "FEMALE"
                                ? ""
                                : custom.value
                            }
                            onChange={(e) => custom.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )} */}
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SexSelect;
