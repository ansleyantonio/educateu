/* eslint-disable @typescript-eslint/no-unused-vars */
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { Card } from "@/components/ui/card";
import { GoDotFill } from "react-icons/go";
import { LuInfo } from "react-icons/lu";

const CredibilityPage = ({ params }: { params: { slug: string } }) => {
  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Credibility" },
      ]}
    >
      <Card>
        <div className="flex flex-wrap gap-2 lg:justify-between items-center p-4">
          <h1 className="text-lg text-black">Credibility History</h1>
          <div className="flex flex-wrap gap-2 lg:items-center">
            <div className="flex items-center gap-2">
              <LuInfo color="#34657C" size={20} />
              <p>Credibility Test Status :</p>
            </div>
            <div className="flex gap-2 items-center py-1 px-3 rounded-full border w-fit border-[#CFD6DD]">
              <GoDotFill color="#30BD29" size={20} />
              <p>Passed</p>
            </div>
          </div>
        </div>
        <hr />
        <div className="p-4">
          <div className="flex gap-2 items-start">
            {/* Icon */}
            <LuInfo size={25} className="flex-shrink-0" />

            {/* Paragraph */}
            <p className="flex-grow">
              Nullam ac amet, Ut convallis. non elit eget ac facilisis tortor.
              libero, ultrices amet, Cras ipsum Nam odio faucibus quam sodales.
              ultrices Nullam vitae elit. dolor odio luctus laoreet id ex sit
              facilisis Nam risus in Ut maximus eu placerat ipsum Cras urna. vel
              faucibus elementum Donec gravida elit varius non. est. convallis.
              nisi sollicitudin. nec vel elit quam nec est. In Cras eu non.
              placerat Nam lacus varius nibh Vestibulum Ut quis malesuada urna
              venenatis felis, non.
            </p>
          </div>

          <p className="p-2 my-4 text-red-500 rounded-md bg-[#FAE1E6]">
            No additional file check was completed
          </p>
        </div>
      </Card>
    </PageWithBreadcrumb>
  );
};
export default CredibilityPage;
