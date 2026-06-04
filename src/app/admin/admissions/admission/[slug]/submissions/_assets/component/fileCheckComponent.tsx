import { StatusWithIcon } from "@/utils/status_point";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { ChevronDown, SquareCheckBig } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FileCheckComponent = ({ generalCheck, additionalCheck }: any) => {
  const totalChecked = Number(generalCheck) + Number(additionalCheck);
  const allPassed = generalCheck && additionalCheck;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="file-check">
          <AccordionTrigger className="w-full group">
            <div className="flex flex-wrap gap-3 justify-start items-center">
              <div className="flex flex-wrap flex-1 gap-3 justify-start items-center">
                <p>File Check:</p>
                <div className="flex gap-3 items-center">
                  {/* Icon with status-based background */}
                  <div
                    className={`p-2 rounded-full ${
                      totalChecked > 0 ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    <SquareCheckBig
                      color={totalChecked > 0 ? "#17B26A" : "#979696"}
                      size={16}
                      strokeWidth={2.5}
                      className={
                        totalChecked > 0
                          ? "scale-110 transition-transform duration-200"
                          : ""
                      }
                    />
                  </div>

                  <div className="flex flex-wrap flex-1 gap-2 items-center text-left lg:items-start">
                    {/* Main content */}
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-blue-600">
                          {totalChecked} File Check Summary
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span
                          className={`text-xs ${
                            totalChecked > 0
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {totalChecked > 0
                            ? `${totalChecked} file${
                                totalChecked !== 1 ? "s" : ""
                              } approved`
                            : "No files approved yet"}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <StatusWithIcon
                      status={
                        allPassed
                          ? "Passed"
                          : totalChecked > 0
                            ? "In Progress"
                            : "Pending"
                      }
                    />
                  </div>
                </div>
              </div>
              {/* Rotating Chevron */}
              <ChevronDown className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-4 space-y-3 text-sm bg-gray-50 border-t border-gray-100">
            {/* Progress bar */}
            {totalChecked > 0 && (
              <div className="pt-2">
                <div className="flex justify-between mb-1 text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round((totalChecked / 2) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      allPassed ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${(totalChecked / 2) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* File status items */}
            <div className="pt-1 space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex gap-2 items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      generalCheck ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="font-medium text-gray-700">
                    General File
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    generalCheck
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {generalCheck ? "✓ Approved" : "Pending"}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex gap-2 items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      additionalCheck ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="font-medium text-gray-700">
                    Additional File
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    additionalCheck
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {additionalCheck ? "✓ Approved" : "Pending"}
                </div>
              </div>
            </div>

            {/* Final status message */}
            <div
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border ${
                allPassed
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  allPassed ? "bg-green-500" : "bg-yellow-500"
                } animate-pulse`}
              />
              <span className="font-semibold">
                {allPassed
                  ? "✅ All files have been approved!"
                  : "⚠️ Some files require approval"}
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default FileCheckComponent;
