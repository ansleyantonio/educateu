/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import CommonSearch from "@/components/common/search/commonSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExpandableText from "@/utils/EnabledText";
import { useState } from "react";
import AssignLessonModal from "./assignLessonModal";

interface ModuleProps {
  id: string;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  assignedData: Array<any>;
}

const AvailableLessonsComponent = ({
  assignedData,
  id,
  setIsWaiting,
}: ModuleProps) => {
  const [searchTerm, setSearchText] = useState("");

  const { data, isLoading } = useFetchData({
    path: `faculty-course-module/${id}/available-lessons${
      searchTerm && `?searchTerm=${searchTerm}`
    }`,
    queryKey: "fetch-assignable-lesson-list",
  });

  return (
    <div className="relative">
      {/* Title */}
      <div className="mb-4">
        <h3>Available Lessons & Quizzes </h3>
        <p className="my-2 text-xs font-thin text-[#011c28]">
          {data?.data?.availableLessons?.length}
        </p>
      </div>

      {/* Search Bar  */}
      <div>
        <CommonSearch
          width="100%"
          searchText={searchTerm}
          setSearchText={setSearchText}
        />
      </div>

      {/* List of Modules  */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center mt-16 h-64">
              <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            </div>
          ) : data?.data?.availableLessons?.length === 0 ? (
            <div className="flex justify-center">
              <div className="col-span-12 lg:col-span-8">
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="mb-2 text-gray-400">📚</div>
                    <div className="text-gray-500">No lessons available</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            data?.data?.availableLessons?.map((lesson: any, i: number) => (
              <div
                key={i}
                className="p-4 mb-4 rounded-md border border-gray-200"
              >
                <h2 className="text-lg font-semibold">{lesson?.title}</h2>
                <div className="flex gap-3 justify-between items-center my-3">
                  <ExpandableText text={lesson?.outcome} />
                  <AssignLessonModal
                    lesson={lesson}
                    id={id}
                    setIsWaiting={setIsWaiting}
                    assignedData={assignedData}
                  />
                </div>
                <p className="text-xs text-gray-400"> 27 June 2023 11:00 AM</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AvailableLessonsComponent;
