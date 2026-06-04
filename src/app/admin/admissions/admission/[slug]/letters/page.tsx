/* eslint-disable @typescript-eslint/no-unused-vars */
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SingleLetter from "./_assets/components/single_letter";

const LettersPage = ({ params }: { params: { slug: string } }) => {
  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Letters" },
      ]}
    >
      <Card>
        <Tabs defaultValue="conditional_letters">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-center p-4 w-full gap-2 lg:gap-0">
            <div className="flex gap-2 lg:items-center">
              <h3>Letters</h3>
              <p className="flex justify-center items-center w-8 h-6 text-sm rounded-full border bg-[#F0F9FF]">
                10
              </p>
            </div>

            <TabsList className="flex lg:gap-3 justify-end items-center">
              <TabsTrigger value="conditional_letters">
                Conditional&nbsp;
                <span className="md:hidden lg:inline"> Letters</span>
              </TabsTrigger>
              <TabsTrigger value="unconditional_letters">
                Unconditional&nbsp;
                <span className="md:hidden lg:inline"> Letters</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <hr />

          {/* content */}
          <TabsContent value="conditional_letters">
            <CardContent className="space-y-2">
              <div className="flex flex-col gap-4 mt-6">
                {conLetterData.map((item, i) => (
                  <SingleLetter key={i} {...item} />
                ))}
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="unconditional_letters">
            <CardContent className="space-y-2">
              <div className="flex flex-col gap-4 mt-6">
                {unConLetterData.map((item, i) => (
                  <SingleLetter key={i} {...item} />
                ))}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </PageWithBreadcrumb>
  );
};
export default LettersPage;

const conLetterData = [
  {
    note: "This letter is conditional upon the successful completion of all required documentation. Please ensure all forms are submitted by the specified deadline in order to proceed with the next steps.",
    role: "agent",
    name: "John Doe",
  },
  {
    note: "Your application is pending approval. The final decision will be made once we have received all the necessary documents. Kindly submit them at your earliest convenience.",
    role: "admin",
    name: "Tony Stark",
  },
  {
    note: "The approval of your application is contingent on a successful background check. Please allow up to 5 business days for the process to be completed.",
    role: "agent",
    name: "Steve Rogers",
  },
];

const unConLetterData = [
  {
    note: "Congratulations, your application has been fully approved! You can proceed with the next steps without any further conditions or requirements. Welcome aboard!",
    role: "agent",
    name: "John Doe",
  },
  {
    note: "Your request has been approved without any conditions. Please proceed with the necessary actions as outlined in the approval letter.",
    role: "admin",
    name: "Tony Stark",
  },
  {
    note: "We are pleased to inform you that your application has been successfully accepted. No additional documents are required at this point. Please check your inbox for further instructions.",
    role: "agent",
    name: "Steve Rogers",
  },
];
