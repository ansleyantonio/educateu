"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { useEffect } from "react";

const AcademicSessionDurationInputForm = ({
  form,
  isEdit,
  modulesPerCourses,
}: {
  form: any;
  isEdit: boolean;
  modulesPerCourses?: boolean;
}) => {
  const courseType = form.watch("courseType");
  const durationLength = form.watch("durationLength");
  const totalCredits = form.watch("totalCredits");

  // Get year credits
  const year1 = parseFloat(form.watch("yearOneExpectedCredits")) || 0;
  const year2 = parseFloat(form.watch("yearTwoExpectedCredits")) || 0;
  const year3 = parseFloat(form.watch("yearThreeExpectedCredits")) || 0;
  const year4 = parseFloat(form.watch("yearFourExpectedCredits")) || 0;

  // Simple sum calculation
  let sumOfYearCredits = 0;
  if (durationLength >= 1) sumOfYearCredits += year1;
  if (durationLength >= 2) sumOfYearCredits += year2;
  if (durationLength >= 3) sumOfYearCredits += year3;
  if (durationLength >= 4) sumOfYearCredits += year4;

  // Validation
  // useEffect(() => {
  //   if (courseType !== "DEGREE_COURSE") return;
  //   if (!totalCredits) return;
  //
  //   const totalNum = parseFloat(totalCredits);
  //
  //   if (totalNum !== sumOfYearCredits) {
  //     form.setError("totalCredits", {
  //       type: "manual",
  //       message: `Credits don't match! Total: ${totalNum}, Year sum: ${sumOfYearCredits}`,
  //     });
  //   } else {
  //     form.clearErrors("totalCredits");
  //   }
  //
  //   // Reset upper years
  //   if (durationLength < 2) form.setValue("yearTwoExpectedCredits", 0);
  //   if (durationLength < 3) form.setValue("yearThreeExpectedCredits", 0);
  //   if (durationLength < 4) form.setValue("yearFourExpectedCredits", 0);
  // }, [courseType, totalCredits, sumOfYearCredits, durationLength, form]);

  useEffect(() => {
    if (courseType !== "DEGREE_COURSE") return;

    // Credit validation - immediate (no delay)
    if (totalCredits) {
      const totalNum = parseFloat(totalCredits);
      const isValid = !isNaN(totalNum) && totalNum === sumOfYearCredits;

      if (!isValid) {
        form.setError("totalCredits", {
          type: "manual",
          message: `Credits don't match! Total: ${totalNum}, Year sum: ${sumOfYearCredits}`,
        });
      } else {
        form.clearErrors("totalCredits");
      }
    }

    // Reset upper years based on duration - with delay
    const timeoutId = setTimeout(() => {
      // Double-check conditions before resetting
      if (courseType === "DEGREE_COURSE") {
        const yearsToReset = [];
        if (durationLength < 2) yearsToReset.push("yearTwoExpectedCredits");
        if (durationLength < 3) yearsToReset.push("yearThreeExpectedCredits");
        if (durationLength < 4) yearsToReset.push("yearFourExpectedCredits");

        yearsToReset.forEach((field) => {
          form.setValue(field, "0"); // Use string "0" instead of number 0
        });
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [courseType, totalCredits, sumOfYearCredits, durationLength, form]);

  return (
    <div className="rounded-md border shadow-md border-searchTerm1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Academic Session and Duration
      </h1>

      <div className="grid grid-cols-1 gap-4 py-6 px-3 rounded-md lg:grid-cols-2 bg-[#FFFFFF]">
        {/* Course Start Date */}
        <CustomField.DatePickerAnd
          form={form}
          name={"startDate"}
          labelName={"Course Start Date"}
          placeholder={"Enter Course Start Date"}
          isDisabled={isEdit}
        />

        {/* Course End Date */}
        <CustomField.DatePickerAnd
          form={form}
          name={"endDate"}
          labelName={"Course End Date"}
          placeholder={"Enter Course End Date"}
          isDisabled={isEdit}
        />

        {/* Course Status */}
        <CustomField.SelectField
          disabled={true}
          form={form}
          name="status"
          labelName="Course Status"
          placeholder="Enter Course Status"
          options={[
            { label: "Published", value: "PUBLISHED" },
            { label: "Unpublished", value: "UNPUBLISHED" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
          type="single"
        />

        {/* Course Duration */}
        <CustomField.Text
          form={form}
          placeholder={"Enter Course Duration"}
          name={"durationLength"}
          labelName={`Course Duration in ${
            courseType == "DEGREE_COURSE" ? "Years" : "Months"
          }`}
          optional={false}
          viewOnly={isEdit}
        />

        {/* Number of Semesters */}
        <CustomField.SelectField
          form={form}
          name={"numberOfSemesters"}
          labelName={"Number of Semesters"}
          viewOnly={isEdit || modulesPerCourses}
          placeholder={"Number of Semesters"}
          options={[
            {
              value: 1,
              label: "1",
            },
            {
              value: 2,
              label: "2",
            },
            {
              value: 4,
              label: "4",
            },
            {
              value: 6,
              label: "6",
            },
            {
              value: 8,
              label: "8",
            },
          ]}
          optional={false}
        />

        {/* Total Credits Required for Completion */}
        <CustomField.Text
          form={form}
          name={"totalCredits"}
          viewOnly={isEdit || modulesPerCourses}
          labelName={"Total Credits Required for Completion"}
          placeholder={"Enter Total Credits Required for Completion"}
        />

        {courseType === "DEGREE_COURSE" && (
          <>
            {/* Year 1 Expected Course Credits  */}
            {durationLength >= 1 && (
              <CustomField.Text
                form={form}
                name={"yearOneExpectedCredits"}
                labelName={"Year 1 Expected Course Credits "}
                optional={false}
                viewOnly={isEdit || modulesPerCourses}
                placeholder={"Enter Year One Expected Course Credits "}
              />
            )}

            {/* Year 2 Expected Course Credits  */}
            {durationLength >= 2 && (
              <CustomField.Text
                form={form}
                name={"yearTwoExpectedCredits"}
                labelName={"Year 2 Expected Course Credits "}
                optional={false}
                viewOnly={isEdit || modulesPerCourses}
                placeholder={"Enter Year Two Expected Course Credits "}
              />
            )}

            {/* Year 3 Expected Course Credits  */}
            {durationLength >= 3 && (
              <CustomField.Text
                form={form}
                name={"yearThreeExpectedCredits"}
                labelName={"Year 3 Expected Course Credits "}
                viewOnly={isEdit || modulesPerCourses}
                optional={false}
                placeholder={"Enter Year Three Expected Course Credits "}
              />
            )}

            {/* Year 4 Expected Course Credits  */}
            {durationLength >= 4 && (
              <CustomField.Text
                form={form}
                name={"yearFourExpectedCredits"}
                labelName={"Year 4 Expected Course Credits "}
                viewOnly={isEdit || modulesPerCourses}
                optional={false}
                placeholder={"Enter Year Four Expected Course Credits "}
              />
            )}
          </>
        )}

        {/* Minimum Passing Credit per Year */}
        <CustomField.Text
          form={form}
          name={"minimumPassingCreditsPerYear"}
          labelName={"Minimum Passing Credit per Year"}
          optional={false}
          viewOnly={isEdit}
          placeholder={"Enter Minimum Passing Credit per Year"}
        />
      </div>
    </div>
  );
};

export default AcademicSessionDurationInputForm;
