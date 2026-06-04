"use client";

import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SendEmailModalRichText } from "@/components/EmailModals/SendEmailModal";

interface DisabilityAndAccessibility {
  disabilityAndAccessibility: string[];
}

interface CriminalBackground {
  disqualificationOrSanction: string;
  disqualificationOrSanctionDetails: string;
  policeClearance: string;
}

interface ApplicationId {
  disabilityAndAccessibility?: DisabilityAndAccessibility;
  criminalBackground?: CriminalBackground;
  personalInformation?: {
    email?: string;
  };
  wellbeingCheckStatus?: string;
  // Add other properties as needed
}

interface DocumentProps {
  applicationId: ApplicationId;
  hasPostAndDeletePermission?: boolean;
}

export const Document = ({
  applicationId,
  hasPostAndDeletePermission,
}: DocumentProps) => {
  console.log("In Document Props now", applicationId);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 p-3 rounded-t-md border border-[#DEE3E7]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="font-semibold text-black text-[18px]">
              Special Required Document
            </h1>
            <p className="font-medium text-gray-500">
              If documents is not provided tap “Request Proof”.
            </p>
          </div>

          <div>
            <button
              disabled={
                !hasPostAndDeletePermission ||
                ["APPROVED", "REJECTED"].includes(
                  applicationId?.wellbeingCheckStatus?.toUpperCase()?.trim() ??
                    ""
                )
              }
              className={`inline-flex gap-2 items-center py-1.5 px-3 text-sm rounded-md border border-gray-300 transition text-[#272E35] ${
                !hasPostAndDeletePermission ||
                ["APPROVED", "REJECTED"].includes(
                  applicationId?.wellbeingCheckStatus?.toUpperCase()?.trim() ??
                    ""
                )
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setOpen(true)}
            >
              <ArrowRight className="w-4 h-4" />
              Request Proof
            </button>
          </div>
        </div>
        <div className="flex flex-col text-sm text-gray-700 mt-[40px]">
          {/* disabilityAndAccessibility*/}
          {applicationId?.disabilityAndAccessibility && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="disability-requirements">
                <AccordionTrigger className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <p className="font-semibold text-black text-[18px]">
                    Disabilities and Accessibility Requirements
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 mt-[20px]">
                    {applicationId?.disabilityAndAccessibility?.disabilityAndAccessibility?.map(
                      (item: string, index: number) => (
                        <label
                          key={index}
                          className="inline-flex gap-2 items-start"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4"
                            checked
                            readOnly
                          />
                          <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                            {item}
                          </p>
                        </label>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {open && (
            <SendEmailModalRichText
              email_to={[`${applicationId?.personalInformation?.email}`]}
              open={open}
              onClose={() => setOpen(false)}
              viewOnly={true}
            />
          )}
        </div>

        <div className="flex flex-col mt-3 text-sm text-gray-700">
          {/* disabilityAndAccessibility*/}
          {applicationId?.criminalBackground && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="disability-requirements">
                <AccordionTrigger className="flex justify-between items-center pb-2 border-b border-gray-700">
                  <p className="font-semibold text-black text-[18px]">
                    Criminal Background
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 mt-[20px]">
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                        Have you ever been convicted by the courts, cautioned,
                        reprimanded, or given a final warning by the police?
                        Please give details of offenses, penalties, and dates in
                        the table below. (Note that the post you have applied
                        for is exempted under the Rehabilitation of Offenders
                        Act (Exceptions Order) 1974, which means that all
                        convictions, cautions, reprimands, and final warnings on
                        your criminal record need to be disclosed.
                      </p>
                      <Input
                        disabled
                        value={
                          applicationId?.criminalBackground
                            ?.disqualificationOrSanction || ""
                        }
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                        Details of Judgement or Civil Penalty
                      </p>
                      <Input
                        disabled
                        value="Answer"
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                        Have you ever been disqualified from working with
                        children or vulnerable adults or subject to any other
                        sanctions imposed by a regulatory body?
                      </p>
                      <Input
                        disabled
                        value={
                          applicationId?.criminalBackground
                            ?.disqualificationOrSanction || ""
                        }
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                        Detailed info on disqualification or sanctions by a
                        regulatory body
                      </p>
                      <Input
                        disabled
                        value={
                          applicationId?.criminalBackground
                            ?.disqualificationOrSanctionDetails ||
                          "No details provided"
                        }
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                        Do you have Police Clearance?
                      </p>
                      <Input
                        disabled
                        value={
                          applicationId?.criminalBackground?.policeClearance ||
                          "No details provided"
                        }
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    {/* {applicationId.disabilityAndAccessibility.disabilityAndAccessibility.map(
                      (item: string, index: number) => (
                        <label
                          key={index}
                          className="inline-flex gap-2 items-start"
                        >
                          <input type="checkbox" className="mt-1 w-4 h-4"  checked readOnly />
                          <p className="text-black text-[14px] leading-[24px] tracking-[0.01em]">
                            {item}
                          </p>
                        </label>
                        
                      )
                    )} */}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>

      {/* <div className="flex flex-col gap-4 text-sm text-gray-700 rounded-b-md border border-t-0 border-[#DEE3E7]">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-4">
                <input
                  type="checkbox"
                  //checked={
                  // selectedRows.size === applications?.data?.applications.length
                  //}
                  //onChange={toggleSelectAll}
                  aria-label="Select all applicants"
                  className="mt-1 ml-5 w-4 h-4"
                />
              </TableHead>
              <TableHead>Document Name</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <input
                  type="checkbox"
                  //checked={
                  // selectedRows.size === applications?.data?.applications.length
                  //}
                  //onChange={toggleSelectAll}
                  aria-label="Select all applicants"
                  className="mt-1 ml-5 w-4 h-4"
                />
              </TableCell>
              <TableCell className="flex items-center">
                <FaRegFilePdf size={32} />
                <p className="ml-2 font-medium leading-5">
                  Document name will be here
                </p>
              </TableCell>
              <TableCell className="text-right">
                <button className="inline-flex gap-2 p-2 text-sm rounded-md border border-gray-300 transition hover:bg-gray-100 text-[#272E35]">
                  <RiDownloadLine className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <input
                  type="checkbox"
                  //checked={
                  // selectedRows.size === applications?.data?.applications.length
                  //}
                  //onChange={toggleSelectAll}
                  aria-label="Select all applicants"
                  className="mt-1 ml-5 w-4 h-4"
                />
              </TableCell>
              <TableCell className="flex items-center">
                <FaRegFilePdf size={32} />
                <p className="ml-2 font-medium leading-5">
                  Document name will be here
                </p>
              </TableCell>
              <TableCell className="text-right">
                <button className="inline-flex gap-2 p-2 text-sm rounded-md border border-gray-300 transition hover:bg-gray-100 text-[#272E35]">
                  <RiDownloadLine className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div> */}
    </div>
  );
};
