"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { useState } from "react";
import { TabButton } from "./_assets/components/tab_button";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import AssignLessonTab from "./_assets/components/assign_lessons/module_assignments";
import { CourseConnectedTab } from "./_assets/components/course_connected/course_connected";
import DiscussionTab from "./_assets/components/discussion/discussion";
import HistoryTab from "./_assets/components/history/history";
import ModuleDetailsTab from "./_assets/components/module_details/module_details";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";

const ModuleAssignmentPage = ({ params }: { params: { slug: string[] } }) => {
  //  const slugPath = params.slug.join("/");
  // console.log("Course Details Page:", { slugPath });

  const [isValue, setIsValue] = useState("module_details");
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/faculty/course-management/" },
        { title: "Course-Managemnet", href: "/faculty/course-management/" },
        { title: "Module", href: "/faculty/course-management/module" },
        {
          title: "Professional-Certificate-Modules",
          href: "/faculty/course-management/module/professional-certificate-modules",
        },
        {
          title: "Module-Assignment",
        },
      ]}
    >
      <div>
        <Tabs defaultValue={isValue}>
          <TabsList>
            <TabButton
              value="module_details"
              label="Module Details"
              onClick={setIsValue}
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
            <TabButton
              value="discussion"
              label="Discussion"
              onClick={setIsValue}
            />
          </TabsList>

          <hr />
          <ScrollArea className="pb-8 h-[calc(100vh-150px)]">
            {/* content */}
            <TabsContent value="module_details">
              <ModuleDetailsTab />
            </TabsContent>
            <TabsContent value="course_connected">
              <CourseConnectedTab />
            </TabsContent>
            <TabsContent value="assign_lesson">
              <AssignLessonTab />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab />
            </TabsContent>
            <TabsContent value="discussion">
              <DiscussionTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ModuleAssignmentPage;
