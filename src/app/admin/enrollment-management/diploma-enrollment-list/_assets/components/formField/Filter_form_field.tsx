/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";

interface FormType {
  form: any;
}
const Filter_Form_field = ({ form }: FormType) => {
  const { options: AwardingBody, isLoading: AwardingBodyLoading } =
    DataFetcher.fetchAwardingBodies();
  const { options: courses, isLoading: courseLoading } =
    DataFetcher.fetchCourses();

  const { options: AcademicSession, isLoading: AcademicSessionLoading } =
    DataFetcher.fetchAcademicSessions();
  const { options: modules, isLoading: moduleLoading } =
    DataFetcher.fetchModules();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <CustomField.SelectField
          form={form}
          name="awardingBodyId"
          labelName="awarding Body"
          placeholder="awarding Body"
          isLoading={AwardingBodyLoading}
          options={AwardingBody}
          type="single"
        />
        {/* <CustomField.SelectField
          form={form}
          name="yearOfEntry"
          labelName="year Of Entry"
          placeholder="year Of Entry"
          options={["2025", "2030"]}
        /> */}
        <CustomField.SelectField
          form={form}
          name="courseId"
          labelName="course"
          placeholder="course"
          isLoading={courseLoading}
          options={courses}
        />
        <CustomField.SelectField
          form={form}
          name="moduleId"
          labelName="module"
          placeholder="module"
          isLoading={moduleLoading}
          options={modules}
        />
        <CustomField.SelectField
          form={form}
          name="sessionId"
          labelName="academic Session"
          isLoading={AcademicSessionLoading}
          placeholder="academic Session"
          options={AcademicSession}
        />
        <CustomField.SelectField
          form={form}
          name="migrationStatus"
          labelName="migration Status"
          placeholder="migration Status"
          options={[
            { label: "Migrated", value: true },
            { label: "Not Migrated", value: false },
          ]}
        />
        {/* <CustomField.SelectField
          form={form}
          name="finance"
          labelName="finance"
          placeholder="finance"
          options={["abc", "xyz"]}
        />
        <CustomField.SelectField
          form={form}
          name="financeCheck"
          labelName="finance Check"
          placeholder="finance Check"
          options={["abc", "xyz"]}
        />
        <CustomField.SelectField
          form={form}
          name="offerOfAcceptance"
          labelName="offer Of Acceptance"
          placeholder="offer Of Acceptance"
          options={["abc", "xyz"]}
        /> */}
      </div>
    </>
  );
};

export default Filter_Form_field;
