"use client";
import CommonLayout from "../common/CommonLayout";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";

const page = () => {
  return (
    <>
    <PageWithBreadcrumb 
      items={[
        { title: "Home", href: "/admin" }, 
        // { title: "Student Roaster", href: "/admin/student-roaster/registry" }, 
        { title: "Registry", href: "/admin/student-roaster/registry" }]}
    >
      <CommonLayout mode="registry"></CommonLayout>
    </PageWithBreadcrumb>
    </>
  );
};

export default page;
