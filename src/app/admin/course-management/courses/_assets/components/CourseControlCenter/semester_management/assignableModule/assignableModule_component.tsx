/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IAssignableModule } from "@/app/admin/course-management/courses/_assets/types/assignable-module";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import CommonSearch from "@/components/common/search/commonSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import dateFormat from "@/utils/DateFormatter";
import ExpandableText from "@/utils/EnabledText";
import { useState } from "react";
import AssignModuleDialog from "./assignModuleDialog";

interface ModuleProps {
  id: string;
  assignedData?: Array<any>;
  semestersNo?: number;
}

const AvailableModuleComponent = ({
  semestersNo,
  assignedData,
  id,
}: ModuleProps) => {
  const [searchTerm, setSearchText] = useState("");

  const { data, isLoading } = useFetchData({
    path: `courses/${id}/available-modules${
      searchTerm && `?searchTerm=${searchTerm}`
    }`,
    queryKey: "fetch-assignable-lesson-list",
  });

  return (
    <div className="relative">
      {/* Title */}
      <div>
        <h3>
          Available Modules{" "}
          {data?.data?.availableModules?.length > 0 && (
            <span className="my-2  !text-xs text-[#011c28]">
              ( {data?.data?.availableModules?.length} )
            </span>
          )}
        </h3>
      </div>

      {/* Search Bar  */}
      <div className="my-4">
        <CommonSearch
          width="100%"
          searchText={searchTerm}
          setSearchText={setSearchText}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {/* List of Modules  */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center mt-16 h-64">
              <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            </div>
          ) : data?.data?.availableModules?.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-2 text-gray-400">📦</div>
                <div className="text-gray-500">No Modules available</div>
              </div>
            </div>
          ) : (
            data?.data?.availableModules?.map((module: IAssignableModule) => {
              const isAssigned = assignedData?.find(
                (item: any) => item?.id === module?.id
              );
              if (isAssigned) return null;

              return (
                <div
                  key={module?.id}
                  className="p-3 mb-5 w-full bg-white rounded-2xl border border-gray-200 shadow-sm transition-shadow duration-300 sm:p-4 hover:shadow-md"
                >
                  {/* Title */}
                  <h2 className="text-lg font-semibold">{module?.title}</h2>

                  {/* Outcome + Assign Button */}
                  <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center">
                    {/* Outcome text with expandable */}
                    <ExpandableText text={module?.description} />

                    {/* Assign button aligned right on larger screens */}
                    <div className="flex justify-end w-full sm:w-auto">
                      <AssignModuleDialog
                        semesters={semestersNo}
                        module={module}
                        id={id}
                      />
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex flex-row gap-3 justify-between items-start lg:flex-col xl:flex-row">
                    {/* Estimated Time */}
                    <p className="flex gap-1 items-center text-xs font-medium text-gray-500 sm:text-sm">
                      <span className="font-semibold text-blue-600">
                        {module?.credit}
                      </span>{" "}
                      Credits
                      {/* {["DEGREE", "DIPLOMA"].includes(lesson?.type) */}
                      {/*   ? "hr" */}
                      {/*   : ["CPD", "PROFESSIONAL_CERTIFICATE"].includes( */}
                      {/*         lesson?.type, */}
                      {/*       ) */}
                      {/*     ? "min" */}
                      {/*     : ""} */}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-400 sm:text-sm">
                      {dateFormat.fullDateTime(module?.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AvailableModuleComponent;
