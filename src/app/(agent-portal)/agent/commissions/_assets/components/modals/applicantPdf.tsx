/* eslint-disable @typescript-eslint/no-explicit-any */

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { Card } from "@/components/ui/card";
import dateFormat from "@/utils/DateFormatter";
import { StatusWithIcon } from "@/utils/status_point";
import { CheckCircle2, XCircle } from "lucide-react";

interface ApplicantPdfProps {
  data: any;
  isLoading: boolean;
}

const ApplicantPdf = ({ data, isLoading }: ApplicantPdfProps) => {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <DataLoader />
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <NoDataComponent />
        </div>
      ) : (
        <div>
          {/* Document Header */}
          <div className="py-10 px-8 text-white bg-gradient-to-r rounded-t-lg from-[#011C28] to-[#015275]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="mb-2 text-2xl font-bold">
                  Application Document
                </h2>
                <p className="text-sm text-slate-300">
                  Reference ID: {data?.application?.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Issued Date</p>
                <p className="font-semibold">
                  {dateFormat.fullDateTime(data?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-8 bg-white">
            {/* Applicant Section */}
            <section className="pb-8 border-b border-slate-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-slate-900">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Applicant Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Name
                  </p>
                  <p className="mt-1 text-lg font-medium text-slate-900">
                    {data?.application?.personalInformation?.firstName}{" "}
                    {data?.application?.personalInformation?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Email
                  </p>
                  <p className="flex gap-2 items-center mt-1 text-lg font-medium text-slate-900">
                    {data?.application?.personalInformation?.email}
                    {data?.application?.personalInformation?.verifiedEmail ? (
                      <CheckCircle2 className="text-emerald-600" size={18} />
                    ) : (
                      <XCircle className="text-rose-500" size={18} />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Phone
                  </p>
                  <p className="mt-1 text-lg font-medium text-slate-900">
                    {data?.application?.personalInformation?.mobileNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Applied Date
                  </p>
                  <p className="mt-1 text-lg font-medium text-slate-900">
                    {dateFormat.fullDateTime(
                      data?.application?.personalInformation?.createdAt,
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Application Status Section */}
            <section className="pb-8 border-b border-slate-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-slate-900">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Application Status
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200">
                  <p className="mb-3 text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Application Status
                  </p>
                  <StatusWithIcon status={data?.application?.status} />
                </Card>
                <Card className="p-6 border-slate-200">
                  <p className="mb-3 text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Interview Result
                  </p>
                  <StatusWithIcon
                    status={data?.application?.interviewOutcome}
                  />
                </Card>
                <Card className="p-6 border-slate-200">
                  <p className="mb-3 text-sm font-semibold tracking-wide uppercase text-slate-600">
                    Reference ID
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {data?.application?.id}
                  </p>
                </Card>
              </div>
            </section>

            {/* Course Section */}
            <section className="pb-8 border-b border-slate-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-slate-900">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Course Details
              </h3>
              <div className="p-6 rounded-lg border bg-slate-50 border-slate-200">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      Course Name
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {
                        data?.application?.courseSelection?.course
                          ?.courseSnapshot?.title
                      }
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      Course Code
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-900">
                      {
                        data?.application?.courseSelection?.course
                          ?.courseSnapshot?.code
                      }
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      University
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {
                        data?.application?.courseSelection?.course
                          ?.courseSnapshot?.awardingBody?.name
                      }
                    </p>
                  </div>
                  {/* <div> */}
                  {/*   <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600"> */}
                  {/*     Duration */}
                  {/*   </p> */}
                  {/*   <p className="text-lg font-semibold text-slate-900"> */}
                  {/*     {data?.course?.duration} */}
                  {/*   </p> */}
                  {/* </div> */}
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="pb-8 border-b border-slate-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-slate-900">
                <span className="w-1 h-6 bg-orange-600 rounded"></span>
                Payment Information
              </h3>
              <Card className="p-8 bg-orange-50 border-2 border-orange-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      Total Fee
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      ${data?.payment?.totalFee}
                      <span className="text-lg font-semibold text-slate-600">
                        {" "}
                        {data?.totalFee}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      Payment Status
                    </p>
                    <StatusWithIcon status={data?.paymentStatus} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600">
                      Due Date
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {dateFormat.fullDateTime(data?.dueDate)}
                    </p>
                  </div>
                  {/* <div> */}
                  {/*   <p className="mb-2 text-sm font-semibold tracking-wide uppercase text-slate-600"> */}
                  {/*     Payment ID */}
                  {/*   </p> */}
                  {/*   <p className="font-mono text-sm font-bold text-slate-900"> */}
                  {/*     {data?.id} */}
                  {/*   </p> */}
                  {/* </div> */}
                </div>
              </Card>
            </section>

            {/* Course Modules Section */}
            {/* <section className="pb-8"> */}
            {/*   <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-slate-900"> */}
            {/*     <span className="w-1 h-6 bg-blue-600 rounded"></span> */}
            {/*     Course Curriculum */}
            {/*   </h3> */}
            {/*   <div className="space-y-4"> */}
            {/*     {data?.modules?.map((module: any) => ( */}
            {/*       <Card key={module?.id} className="p-6 border-slate-200"> */}
            {/*         <h4 className="mb-4 font-bold text-slate-900"> */}
            {/*           {module?.title} */}
            {/*         </h4> */}
            {/*         <div className="ml-4 space-y-2"> */}
            {/*           {module?.lessons?.map((lesson: any, idx: number) => ( */}
            {/*             <div */}
            {/*               key={idx} */}
            {/*               className="flex justify-between items-center text-slate-700" */}
            {/*             > */}
            {/*               <p className="flex gap-2 items-center"> */}
            {/*                 <span className="w-2 h-2 bg-blue-600 rounded-full"></span> */}
            {/*                 {lesson?.title} */}
            {/*               </p> */}
            {/*               <p className="text-sm text-slate-500"> */}
            {/*                 {lesson?.duration} */}
            {/*               </p> */}
            {/*             </div> */}
            {/*           ))} */}
            {/*         </div> */}
            {/*       </Card> */}
            {/*     ))} */}
            {/*   </div> */}
            {/* </section> */}

            {/* Footer */}
            <div className="pt-8 text-sm text-center border-t border-slate-200 text-slate-600">
              <p>
                This is a preview of your application. Please review all details
                carefully before proceeding to payment.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Generated on {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicantPdf;
