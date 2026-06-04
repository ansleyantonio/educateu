"use client"
import { useState } from "react";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CreateCourseTypeFinanceForm from "../../_assets/components/create/createCourseTypeFinanceForm";

const CreateDiplomaCourse = () => {

  const [isEdit, setIsEdit] = useState(true);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/" },
        { title: "Finance", href: "/admin/finance/certificate-course-fee/cpd" },
        {
          title: "Advanced Course Diploma Fee",
          href: "/admin/finance/advanced-course-fee/diploma",
        },
        {
          title: "Create Diploma Course Fee",
        },
      ]}
    >
      <CreateCourseTypeFinanceForm moduleType="diploma" isEdit={isEdit}/>
    </PageWithBreadcrumb>
  );
};

export default CreateDiplomaCourse;
