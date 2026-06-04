/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import {
  TabButton,
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useState } from "react";
import CourseDetails from "./course_details/course_details";
import AssignModuleTab from "./assign_module/module_assignments";
import AllStudentsCardTable from "./allStudents/student_card_table";
import CourseLogHistoryTab from "./courseLogHistory/courseLogHistory";
import SemesterManagement from "./semester_management/semester_management";

interface Props {
  data: any;
  isLoading: boolean;
  id: string;
}
const CourseTabsPortal = ({ data, isLoading, id }: Props) => {
  const [isValue, setIsValue] = useState("course_details");

  const course = data?.data?.course;

  if (isLoading) {
    return (
      <div>
        <DataLoader />
      </div>
    );
  }

  console.log("COURSE TEst", data?.data?.course?.courseType);

  return (
    <div>
      <Tabs defaultValue={isValue}>
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList>
            <TabButton
              value="course_details"
              label="Course Details"
              onClick={setIsValue}
            />
            <TabButton
              value="module_assign"
              label="Module Assign"
              onClick={setIsValue}
            />
            <TabButton value="students" label="Students" onClick={setIsValue} />
            <TabButton
              value="course_history"
              label="Course History"
              onClick={setIsValue}
            />
          </TabsList>
        </div>
        <hr />
        {/* content */}
        <TabsContent value="course_details">
          <ScrollArea className="h-[calc(100vh-190px)]">
            <CourseDetails course={course} />
          </ScrollArea>
        </TabsContent>

        {["CPD_COURSE", "PROFESSIONAL_COURSE"].includes(course?.courseType) && (
          <TabsContent value="module_assign">
            <AssignModuleTab type={data?.data?.course?.courseType} id={id} />
          </TabsContent>
        )}

        {["DIPLOMA_COURSE", "DEGREE_COURSE"].includes(course?.courseType) && (
          <TabsContent value="module_assign">
            <ScrollArea className="h-[calc(100vh-190px)]">
              <SemesterManagement
                id={id}
                type={data?.data?.course?.courseType}
                semestersNo={course?.numberOfSemesters}
              />
            </ScrollArea>
          </TabsContent>
        )}
        <TabsContent value="students">
          {/* <ScrollArea className="h-[calc(100vh-195px)]"> */}
          <AllStudentsCardTable id={id} />
          {/* </ScrollArea> */}
        </TabsContent>

        <TabsContent value="course_history">
          <CourseLogHistoryTab id={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseTabsPortal;
