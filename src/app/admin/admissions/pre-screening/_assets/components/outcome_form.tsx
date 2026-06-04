/* eslint-disable @typescript-eslint/no-explicit-any */
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useState } from "react";
import { CiUser } from "react-icons/ci";
import { FaGraduationCap } from "react-icons/fa";
import { GoDot } from "react-icons/go";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { LuClock2 } from "react-icons/lu";
import { MdOutlineCalendarMonth, MdOutlineLocalPhone } from "react-icons/md";
import { outComeController } from "../query_controller/outComeController";
import formatDateOnly from "../utils/formatDateOnly";
import { ConfirmationDialog } from "./confirmationDialog";
import dateFormat from "@/utils/DateFormatter";
import { StatusWithIcon } from "@/utils/status_point";
import { Mail } from "lucide-react";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

interface OutComeFormProps {
  applications: Applicant[];
  isLoading: boolean;
  onOutcomeSubmit: () => void;
}

type Role = {
  id: string;
  name: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
};

type UserPortalCategory = {
  id: string;
  user: User;
};

type PreScreeningHistory = {
  id: string;
  outcome: string;
  template: string;
  createdAt: string;
  createdBy: string;
  // createdBy: {
  //   role: Role;
  //   userPortalCategory: UserPortalCategory;
  // };
};

interface Applicant {
  outcome: string;
  id: string;
  createdAt: string;
  personalInformation: {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
  };
  interviews?: any;
  courseSelection: {
    course: any;
  };
  preScreeningHistories?: PreScreeningHistory[];
}

export function OutComeForm({
  applications,
  isLoading,
  onOutcomeSubmit,
}: OutComeFormProps) {
  // const queryClient = useQueryClient();
  const user = useAuths();
  const token = user?.user?.token;

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  // NEW: Use getUserAccess for permission logic
  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  const [outCome, setOutCome] = useState<{ [key: string]: string }>({});
  const [template, setTemplate] = useState<{ [key: number]: string }>({});
  const [description, setDescription] = useState<{ [key: number]: string }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  const applicationIds = applications?.map((applicant) => applicant.id);

  const handleConfirmSubmit = async () => {
    if (currentIdx === null || !token) return;

    const idx = currentIdx;
    const outcomeValue = outCome[idx] ?? "did_not_pick_up";
    const templateValue =
      outcomeValue === "incomplete_or_pending"
        ? template[idx] ?? ""
        : `Template of ${outcomeValue.replace(/_/g, " ")}.`;
    const descriptionValue = description[idx] ?? "";

    try {
      const result = await outComeController({
        token,
        data: {
          applicationId: applicationIds[idx],
          outcome:
            outcomeValue
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()) + ".",
          template: templateValue,
          description: descriptionValue,
        },
      });

      if (result.statusCode === 200) {
        setIsDialogOpen(false); // close dialog
        onOutcomeSubmit(); // refresh data
      }
    } catch (error) {
      console.error("Failed to submit outcome:", error);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-230px)]">
          <DataLoader />
        </div>
      ) : (
        <>
          {applications?.length === 0 ? (
            <div className="relative mt-40">
              <NoDataComponent />
            </div>
          ) : (
            <>
              {applications?.map((applicant: Applicant, idx: number) => {
                const hasPassedAlready = applicant.preScreeningHistories?.some(
                  (history) => {
                    const outcome = history.outcome.trim().toLowerCase();
                    return (
                      outcome === "passed" ||
                      outcome === "pre screening passed."
                    );
                  }
                );
                return (
                  <div key={idx} className="space-y-3">
                    <form
                      className="grid grid-cols-4 gap-6 p-6 bg-white rounded-md shadow"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          outCome[idx] === "incomplete_or_pending" &&
                          !template[idx]
                        ) {
                          showToast(
                            "error",
                            "Please select a template before saving."
                          );
                          return;
                        }
                        setCurrentIdx(idx);
                        setIsDialogOpen(true);
                      }}
                    >
                      {/* Interview Details */}
                      <div className="space-y-4">
                        <div className="flex gap-2 items-center">
                          <MdOutlineCalendarMonth />
                          {applicant?.interviews ? (
                            <p>
                              {dateFormat.fullDateTime(
                                applicant?.interviews?.[0]?.interviewDate,
                                {
                                  showTime: false,
                                  local: true,
                                }
                              )}
                            </p>
                          ) : (
                            "N/A"
                          )}
                        </div>

                        <div className="flex gap-2 items-center">
                          <LuClock2 />
                          {applicant?.interviews ? (
                            <p>
                              {dateFormat.time12h(
                                applicant?.interviews?.[0]?.startTime,
                                {
                                  local: true,
                                }
                              )}
                            </p>
                          ) : (
                            "N/A"
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <HiOutlineLocationMarker />
                          <p>{applicant?.interviews?.[0]?.location || "N/A"}</p>
                        </div>
                        <div className="flex gap-2 items-center -ml-1">
                          <GoDot size={25} />
                          <StatusWithIcon
                            status={
                              applicant?.interviews?.interviewOutCome ??
                              "Pending"
                            }
                          />
                        </div>
                      </div>

                      {/* Applicant Info */}
                      <div className="space-y-4">
                        <div className="flex gap-2 items-center">
                          <CiUser strokeWidth={2} size={17} />
                          <p>
                            {applicant?.personalInformation?.firstName +
                              " " +
                              applicant?.personalInformation?.lastName}
                          </p>
                        </div>

                        <div className="flex gap-2 items-center">
                          <FaGraduationCap />
                          <p>
                            {applicant?.courseSelection?.course?.course
                              ?.title ?? "N/A"}
                          </p>
                        </div>

                        <div className="flex gap-2 items-center">
                          <MdOutlineLocalPhone />
                          <p>
                            {applicant?.personalInformation?.mobileNumber ??
                              "N/A"}
                          </p>
                        </div>

                        <div className="flex gap-2 items-center">
                          <Mail size={15} />
                          <p>{applicant?.personalInformation?.email}</p>
                        </div>
                      </div>

                      {/* Pre-Screening Outcome History */}
                      <div>
                        {applicant?.preScreeningHistories?.length ? (
                          <div className="space-y-2">
                            {applicant.preScreeningHistories.map((history) => {
                              const status = /passed\b/i.test(history.outcome)
                                ? "passed"
                                : /failed\b/i.test(history.outcome)
                                ? "failed"
                                : "neutral";

                              const statusStyles = {
                                passed: "text-green-700 bg-green-100",
                                failed: "text-red-700 bg-red-100",
                                neutral: "text-gray-700 bg-gray-100",
                              };

                              console.log("HISTORY", history);

                              const creator = history.createdBy;
                              // history.createdBy?.userPortalCategory?.user;
                              const creatorName = creator
                                ? // ? `${creator.firstName} ${creator.lastName}`
                                  creator
                                : "Unknown";

                              // Format the outcome text to proper case
                              const formatOutcomeText = (text: string) => {
                                return text
                                  .toLowerCase()
                                  .replace(/\b\w/g, (char) =>
                                    char.toUpperCase()
                                  );
                              };

                              return (
                                <p
                                  key={history.id}
                                  className={`py-1 px-2 text-sm text-center rounded-md ${statusStyles[status]}`}
                                >
                                  {formatOutcomeText(history.outcome)} by{" "}
                                  {creatorName}
                                </p>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="py-1 px-2 text-sm text-center text-gray-600 bg-gray-200 rounded-md">
                            No Pre-Screening History
                          </p>
                        )}
                      </div>

                      {/* Pre-Screening Outcome */}
                      <div className="space-y-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Select Outcome
                          </label>
                          <Select
                            defaultValue={outCome[idx] ?? "did_not_pick_up"}
                            onValueChange={(value) =>
                              setOutCome((prev) => ({
                                ...prev,
                                [idx]: value,
                              }))
                            }
                            disabled={
                              !hasPostAndDeletePermission ||
                              hasPassedAlready ||
                              applicant?.outcome === "APPROVED"
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Did not Pick up" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="did_not_pick_up">
                                  Did not Pick Up
                                </SelectItem>
                                <SelectItem value="incomplete_or_pending">
                                  Incomplete/Pending
                                </SelectItem>
                                <SelectItem value="pre_screening_failed">
                                  Pre-Screening Failed
                                </SelectItem>
                                <SelectItem value="pre_screening_failed_2nd_time">
                                  Pre-Screening Failed 2<sup>nd</sup> Time
                                </SelectItem>
                                <SelectItem value="pre_screening_passed">
                                  Pre-Screening Passed
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {outCome[idx] === "incomplete_or_pending" && (
                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              Select Template
                            </label>
                            <Select
                              disabled={
                                !hasPostAndDeletePermission ||
                                hasPassedAlready ||
                                applicant?.outcome === "APPROVED"
                              }
                              value={template[idx] ?? ""}
                              onValueChange={(value) =>
                                setTemplate((prev) => ({
                                  ...prev,
                                  [idx]: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="postpone">
                                    Postpone
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="missing_documents">
                                    Missing Documents
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            placeholder="The text will be sent to both applicants and agent email body."
                            disabled={
                              !hasPostAndDeletePermission ||
                              hasPassedAlready ||
                              applicant?.outcome === "APPROVED"
                            }
                            value={description[idx] ?? ""}
                            onChange={(e) =>
                              setDescription((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <ul className="pl-5 mt-2 text-sm list-disc text-gray-700">
                          <li>The form must be filled out completely.</li>
                          <li>
                            Ensure the selected outcome matches the applicant’s
                            status.
                          </li>
                        </ul>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          variant="success"
                          disabled={
                            !hasPostAndDeletePermission ||
                            hasPassedAlready ||
                            applicant?.outcome === "APPROVED"
                          }
                        >
                          Save Outcome
                        </Button>
                      </div>
                    </form>
                    <hr />
                    <ConfirmationDialog
                      isOpen={isDialogOpen && currentIdx === idx}
                      onClose={() => setIsDialogOpen(false)}
                      onConfirm={handleConfirmSubmit}
                    />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </>
  );
}
