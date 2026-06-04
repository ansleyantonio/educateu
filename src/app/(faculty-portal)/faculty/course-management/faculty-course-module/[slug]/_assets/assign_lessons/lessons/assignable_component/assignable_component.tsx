/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CommonSearch from "@/components/common/search/commonSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabButton,
} from "@/components/ui/custom_ui/primary_tabs";
import LessonComponent from "./lessonComponent";
import AssessmentsComponent from "./assessmentsComponent";

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
  const [value, setValue] = useState("lessons");
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [totalAssessments, setTotalAssessments] = useState<number>(0);

  return (
    <div className="relative">
      {/* Title */}
      {/* <div className="mb-4"> */}
      {/*   <h3> */}
      {/*     Available Lessons{" "} */}
      {/*     <span className="my-2 ml-3 text-xs font-thin text-[#011c28]"> */}
      {/*       ( {data?.data?.availableLessons?.length}) */}
      {/*     </span> */}
      {/*   </h3> */}
      {/* </div> */}

      {/* Search Bar  */}
      <div>
        <CommonSearch
          width="100%"
          searchText={searchTerm}
          setSearchText={setSearchText}
        />
      </div>

      <Tabs defaultValue={value}>
        <div className="mt-2 rounded-md border shadow-md border-1 border-[#EAEAEA]">
          <TabsList>
            <TabButton
              value="lessons"
              label="Lessons"
              total={totalLessons}
              onClick={setValue}
            />
            <TabButton
              value="assessments"
              label="Assessments"
              total={totalAssessments}
              onClick={setValue}
            />
          </TabsList>
        </div>

        <hr />

        <ScrollArea className="h-[calc(100vh-300px)]">
          {/* content */}
          <TabsContent value="lessons">
            <LessonComponent
              id={id}
              setIsWaiting={setIsWaiting}
              searchTerm={searchTerm}
              assignedData={assignedData}
              setTotalLessons={setTotalLessons}
            />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsComponent
              id={id}
              setIsWaiting={setIsWaiting}
              searchTerm={searchTerm}
              assignedData={assignedData}
              setTotalAssessments={setTotalAssessments}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default AvailableLessonsComponent;
