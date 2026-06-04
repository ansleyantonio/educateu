/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabButton } from "@/components/ui/TabButton";
import { useState } from "react";
import { CourseConnectedTab } from "./course_connected/course_connected";
import DiscussionTab from "./discussion/discussion";
import ModuleDetailsTab from "./module_details/module_details";
import AssignLessonTab from "./assign_lessons/lesson_assignments";
import ModuleLogHistoryTab from "./allHistory/allHistory";

interface Props {
  id: string;
  data: any;
  isLoading: boolean;
  // refetch: () => void;
}
const ModuleTabsPortal = ({ id, data, isLoading }: Props) => {
  const [isValue, setIsValue] = useState("module_details");

  // console.log("DATA IN MODULE PORTAL", data);

  return (
    <div>
      <Tabs defaultValue={isValue}>
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList>
            <TabButton
              value="module_details"
              label="Module Details"
              onClick={() => {
                setIsValue("module_details");
              }}
            />
            <TabButton
              value="course_connected"
              label="Course Connected"
              onClick={setIsValue}
            />

            <TabButton
              value="assign_lesson"
              label="Assign Lesson"
              onClick={setIsValue}
            />

            <TabButton value="history" label="History" onClick={setIsValue} />
            {/* <TabButton
            value="discussion"
            label="Discussion"
            onClick={setIsValue}
          /> */}
          </TabsList>
        </div>
        <hr />
        {/* <ScrollArea className="pb-8 h-[calc(100vh-180px)]"> */}
        {isLoading ? (
          <div>
            <DataLoader />
          </div>
        ) : (
          <>
            {/* Module Details */}
            <TabsContent value="module_details">
              <ScrollArea className="pb-8 h-[calc(100vh-195px)]">
                <ModuleDetailsTab moduleData={data?.data?.courseModule} />
              </ScrollArea>
            </TabsContent>

            {/* Course Connected List */}
            <TabsContent value="course_connected">
              <ScrollArea className="pb-8 h-[calc(100vh-195px)]">
                <CourseConnectedTab id={id} />
              </ScrollArea>
            </TabsContent>

            {/* Assign Lesson */}
            <TabsContent value="assign_lesson">
              <AssignLessonTab
                id={id}
                type={data?.data?.courseModule?.courseType}
              />
            </TabsContent>

            {/* Log History */}
            <TabsContent value="history">
              <ScrollArea className="pb-8 h-[calc(100vh-195px)]">
                <ModuleLogHistoryTab id={id} />
              </ScrollArea>
            </TabsContent>

            {/* Discussion Board */}
            <TabsContent value="discussion">
              <ScrollArea className="pb-8 h-[calc(100vh-195px)]">
                <DiscussionTab />
              </ScrollArea>
            </TabsContent>
          </>
        )}
        {/* </ScrollArea> */}
      </Tabs>
    </div>
  );
};

export default ModuleTabsPortal;
