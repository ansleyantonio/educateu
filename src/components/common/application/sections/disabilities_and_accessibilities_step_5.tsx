// import { CustomField } from "../../fields/cusInputField";

// /* eslint-disable @typescript-eslint/no-explicit-any */
// const Disabilities_and_accessibility_step_5 = ({
//   form,
//   viewOnly = false,
// }: any) => {
//   const disability = form.watch(
//     "disabilityAndAccessibility.disabilityAndAccessibility"
//   );

//   // if disability value is Other then otherSex value "" set
//   if (disability && !disability.includes("OTHER")) {
//     form.setValue(
//       "disabilityAndAccessibility.disabilityAndAccessibilityOther",
//       ""
//     );
//   }

//   return (
//     <div>
//       <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5">
//         <CustomField.SelectField
//           form={form}
//           name="disabilityAndAccessibility.disabilityAndAccessibility"
//           labelName="Disabilities and accessibilities Requirements"
//           options={[
//             { label: "No Known Disability", value: "No Known Disability" },
//             {
//               label:
//                 "A long standing illness or health condition such as cancer HIV diabetes chronic heart disease or epilepsy",
//               value:
//                 "A long standing illness or health condition such as cancer HIV diabetes chronic heart disease or epilepsy",
//             },
//             {
//               label:
//                 "A mental health condition such as depression schizophrenia or anxiety disorder",
//               value:
//                 "A mental health condition such as depression schizophrenia or anxiety disorder",
//             },
//             {
//               label:
//                 "Neurodiversity such as Autism, ADHD and/or Sensory Processing condition",
//               value:
//                 "Neurodiversity such as Autism, ADHD and/or Sensory Processing condition",
//             },
//             {
//               label:
//                 "Two or more impairments and/or disabling medical conditions",
//               value:
//                 "Two or more impairments and/or disabling medical conditions",
//             },
//             {
//               label:
//                 "disability impairment or medical condition that is not listed above",
//               value:
//                 "disability impairment or medical condition that is not listed above",
//             },
//             {
//               label: "OTHER",
//               value: "OTHER",
//             },
//           ]}
//           placeholder="Disabilities and accessibilities Requirements"
//           type="multiple"
//           viewOnly={viewOnly}
//         />

//         {disability?.includes("OTHER") && (
//           <CustomField.Text
//             form={form}
//             name="disabilityAndAccessibility.disabilityAndAccessibilityOther"
//             labelName="Disabilities and accessibilities (Other)"
//             placeholder="Disabilities and accessibilities"
//             viewOnly={viewOnly}
//           />
//         )}

//       </div>
//     </div>
//   );
// };

// export default Disabilities_and_accessibility_step_5;

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CustomField } from "@/components/common/fields/cusInputField";
const Disabilities_and_accessibility_step_5 = ({ form }: any) => {
  const disability = form.watch(
    "disabilityAndAccessibility.disabilityAndAccessibility"
  );

  const handleDisabilityChange = (selected: string[]) => {
    // if "No_Known_Disability" is selected, only keep that
    if (selected.includes("NO_KNOWN_DISABILITY")) {
      form.setValue("disabilityAndAccessibility.disabilityAndAccessibility", [
        "NO_KNOWN_DISABILITY",
      ]);
    } else {
      // remove "No_Known_Disability" if any other option selected
      form.setValue(
        "disabilityAndAccessibility.disabilityAndAccessibility",
        selected.filter((v) => v !== "NO_KNOWN_DISABILITY")
      );
    }
  };

  // if disability value is Other then otherSex value "" set
  if (disability && !disability.includes("OTHER")) {
    form.setValue(
      "disabilityAndAccessibility.disabilityAndAccessibilityOther",
      ""
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 w-full items-top">
        <CustomField.SelectField
          form={form}
          name="disabilityAndAccessibility.disabilityAndAccessibility"
          labelName="Disabilities and accessibilities Requirements"
          options={[
            { label: "No Known Disability", value: "NO_KNOWN_DISABILITY" },
            {
              label:
                "A long standing illness or health condition such as cancer, HIV, diabetes, chronic heart disease or epilepsy",
              value: "LONG_STANDING_ILLNESS",
            },
            {
              label:
                "A mental health condition such as depression, schizophrenia or anxiety disorder",
              value: "MENTAL_HEALTH_CONDITION",
            },
            {
              label:
                "Neurodiversity such as Autism, ADHD and/or Sensory Processing condition",
              value: "NEURODIVERSITY",
            },
            {
              label:
                "Two or more impairments and/or disabling medical conditions",
              value: "MULTIPLE_IMPAIRMENTS",
            },
            {
              label:
                "Disability, impairment or medical condition not listed above",
              value: "OTHER_CONDITION",
            },
            {
              label: "Other",
              value: "OTHER",
            },
          ]}
          placeholder="Disabilities and accessibilities Requirements"
          type="multiple"
          onValueChange={handleDisabilityChange}
        />

        {disability?.includes("OTHER") && (
          <CustomField.Text
            form={form}
            name="disabilityAndAccessibility.disabilityAndAccessibilityOther"
            labelName="Disabilities and accessibilities (Other)"
            placeholder="Disabilities and accessibilities"
          />
        )}
      </div>
    </div>
  );
};

export default Disabilities_and_accessibility_step_5;
