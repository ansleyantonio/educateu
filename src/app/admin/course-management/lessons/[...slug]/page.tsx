"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import {
  TabButton,
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useState } from "react";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import LessonDetailsTab from "./_assets/components/lesson_details/lesson_details";
import ContentSortingTab from "./_assets/components/ContentSortingTab/contentSortingTab";
import { ILessonForm } from "../_assets/schemas/lessonSchema";
import { formatLessonData } from "../_assets/utils/LessonDefaultValue";
import LessonHistoryTab from "./_assets/components/history/history";

const ModuleAssignmentPage = ({ params }: { params: { slug: string[] } }) => {
  const id = params.slug[params.slug.length - 1];
  const [isValue, setIsValue] = useState("lesson_details");

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: `lessons/getById`,
    filterData: { id: id },
    queryKey: "fetch-lesson-details",
  });

  const lesson: ILessonForm & { id?: string } = formatLessonData(
    data?.data?.lesson,
  );

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Lessons",
          href: "/admin/course-management/lessons",
        },
        {
          title: data?.data?.lesson?.title,
        },
      ]}
    >
      <Tabs defaultValue={isValue}>
        <TabsList>
          <TabButton
            value="lesson_details"
            label="Lesson Details"
            onClick={setIsValue}
          />
          <TabButton
            value="content_sorting"
            label="Content Sorting"
            onClick={setIsValue}
          />

          <TabButton value="history" label="History" onClick={setIsValue} />
        </TabsList>

        <hr />
        {isLoading ? (
          <div>
            <DataLoader />
          </div>
        ) : (
          <>
            {/* content */}
            <TabsContent value="lesson_details">
              <ScrollArea className="h-[calc(100vh-195px)]">
                <LessonDetailsTab data={lesson} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="content_sorting">
              <ScrollArea className="h-[calc(100vh-195px)]">
                <ContentSortingTab lesson={lesson} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history">
              <ScrollArea className="h-[calc(100vh-195px)]">
                <LessonHistoryTab id={lesson?.id as string} />
              </ScrollArea>
            </TabsContent>
          </>
        )}
      </Tabs>
    </PageWithBreadcrumb>
  );
};

export default ModuleAssignmentPage;
