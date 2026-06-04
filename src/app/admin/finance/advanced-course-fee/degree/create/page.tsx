"use client"
import { useState } from "react";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CreateCourseTypeFinanceForm from "../../_assets/components/create/createCourseTypeFinanceForm";

const CreateDegreeCourse = () => {

  const [isEdit, setIsEdit] = useState(true);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/" },
        { title: "Finance",
          href: "/admin/finance/certificate-course-fee/cpd"
        },
        {
          title: "Advanced Course Fee",
          href: "/admin/finance/advanced-course-fee/degree"
        },
        {
          title: "Create Degree Course Fee",
        },
      ]}
    >
      <CreateCourseTypeFinanceForm moduleType="degree" isEdit={isEdit}/>
    </PageWithBreadcrumb>
  );
};

export default CreateDegreeCourse;
