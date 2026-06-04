"use client"
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import Page from "../../page";
import CommonLayout from "../common/CommonLayout";

const page = () => {
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // { title: "Student Roaster", href: "/admin/student-roaster/support" }, 
        { title: "Support", href: "/admin/student-roaster/support" }]}
    >
      <CommonLayout mode="support" />
    </PageWithBreadcrumb>
  );
};

export default page;
