import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import GeneralFileChecks from "./_assets/components/general_file_checks";
// import AdditionalFileChecks from "./_assets/components/additional_file_checks";

const ChecksPage = ({ params }: { params: { slug: string } }) => {
  const id = params.slug;

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Checks" },
      ]}
    >
      <div>
        <GeneralFileChecks id={id} />

        {/* <AdditionalFileChecks /> */}
      </div>
    </PageWithBreadcrumb>
  );
};
export default ChecksPage;
