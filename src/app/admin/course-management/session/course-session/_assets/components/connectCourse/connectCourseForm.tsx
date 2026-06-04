/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface ModuleProps {
  form: UseFormReturn<any>;
  isEditMode?: boolean;
}
const ConnectCourseForm = ({ form, isEditMode = true }: ModuleProps) => {
  const [searchTerms, setSearchTerms] = useState("");

  const { options: courseOptions } = DataFetcher.fetchCourses({
    filter: {
      status: ["PUBLISHED"],
      courseType: ["DEGREE_COURSE", "DIPLOMA_COURSE"],
      // courseType: "DEGREE_COURSE",
      searchTerm: searchTerms,
      pageSize: 10,
    },
  });

  return (
    <div>
      <CustomField.SelectField
        type="multiple"
        form={form}
        name="courseIds"
        labelName="Select Course"
        placeholder="Select Course"
        options={courseOptions}
        viewOnly={isEditMode}
        onSearch={(value) => setSearchTerms(value)}
      />
    </div>
  );
};

export default ConnectCourseForm;
