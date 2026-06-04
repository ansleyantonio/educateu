"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ModuleTabsPortal from "../../_assets/components/moduleControlCenter/modulePortal";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";

const SingleModuleDetails = ({ params }: { params: { slug: string[] } }) => {
  const id = params.slug[params.slug.length - 1];

  const { data, isLoading } = DataFetcher.fetchSingleModule({ moduleId: id });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Diploma Modules",
          href: "/admin/course-management/module/diploma-modules",
        },
        {
          title: data?.data?.courseModule?.title.slice(0, 20),
        },
      ]}
    >
      <ModuleTabsPortal isLoading={isLoading} data={data} id={id} />
    </PageWithBreadcrumb>
  );
};

export default SingleModuleDetails;
