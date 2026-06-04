/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Accordion } from "@/components/ui/custom_ui/course-accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import LessonList from "./lessons/lessonList";
import AssignedProgressStatus from "@/app/admin/course-management/_assets/components/assignedProgressStatus";
import AvailableLessonsComponent from "./lessons/assignable_component/assignable_component";

// Types
interface LessonContent {
  id: string;
  title: string;
  description: string;
  type: string;
  paths: string[];
  lesson: string;
  createdAt: string;
  updatedAt: string;
}

interface ModuleLesson {
  id: string;
  courseModuleId: string;
  lessonId: string;
  index: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  code: string;
  outcome: string;
  type: string;
  estimatedTimeToComplete: number;
  createdAt: string;
  updatedAt: string;
  contents: LessonContent[];
  moduleLessons: ModuleLesson[];
  index: number;
}

// Main Component
export default function AssignLessonTab({
  id,
  availableLessons = false,
  type,
}: {
  id: string;
  availableLessons?: boolean;
  type?: string;
}) {
  const { data, isLoading } = useFetchData({
    path: `course-modules/${id}/assigned-contents`,
    queryKey: "fetch-assigned-contents",
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);
  //  const [assignedData, setAssignedData] = useState<Lesson[]>([]);
  const queryClient = useQueryClient();

  const assignedData: Lesson[] = data?.data?.assignedContents;

  // Toggle accordion
  const toggleList = (value: string) => {
    setOpenList((prev) => (prev === value ? null : value));
  };

  // Sync data from API into local state and sort by index

  // useEffect(() => {
  //   if (data?.data?.assignedContents) {
  //     setAssignedData(data?.data?.assignedContents);
  //   }
  // }, [data?.data?.assignedContents]);

  // Handle drag-and-drop sorting
  const handleSortableDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = assignedData.findIndex((i) => i.id === active.id);
    const newIndex = assignedData.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(assignedData, oldIndex, newIndex);

    // Make new array visible immediately (optimistic updates)
    // setAssignedData(newItems);

    // Get only the dragged item with its new position
    const draggedItem = newItems[newIndex];
    const updatePayload = {
      lessonId: draggedItem.id,
      index: newIndex,
    };

    // console.log("updatePayload", updatePayload);

    // Send only the single dragged item
    updateContentIndexesMuted.mutate(updatePayload);
  };

  // Send reordered lessons to backend
  const updateContentIndexesMuted = useApiMutation({
    safe: false,
    path: `course-modules/${id}/update-lessons-index`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: [`course-modules/${id}/assigned-lessons`],
      });
      queryClient.invalidateQueries({
        queryKey: [`fetch-assigned-contents`],
      });
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  return (
    <div
      className={`w-full ${availableLessons ? null : "grid grid-cols-12 gap-3 pt-3 "}`}
    >
      {/* Left: Assigned Lessons */}
      <div
        className={`${availableLessons ? "w-full" : "col-span-12 lg:col-span-8"}`}
      >
        {type && (
          <AssignedProgressStatus
            title="Lessons Assigned"
            type={type}
            total={data?.meta?.moduleTotal}
            assigned={data?.meta?.assignedLessonsTotal}
          />
        )}

        <ScrollArea className="h-[calc(100vh-250px)]">
          {updateContentIndexesMuted.isPending || isWaiting || isLoading ? (
            <div className="flex justify-center items-center mt-16 h-64">
              <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            </div>
          ) : assignedData?.length === 0 ? (
            <div className="flex justify-center items-center mt-14 h-64">
              <div className="text-center">
                <div className="mb-2 text-gray-400">📚</div>
                <div className="text-gray-500">No lessons assigned yet</div>
              </div>
            </div>
          ) : (
            <DndContext
              onDragStart={() => setOpenList(null)}
              onDragEnd={handleSortableDrag}
              modifiers={[
                restrictToVerticalAxis,
                restrictToFirstScrollableAncestor,
              ]}
            >
              <SortableContext
                items={assignedData?.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion
                  type="single"
                  collapsible
                  value={openList ?? undefined}
                  onValueChange={setOpenList}
                >
                  {assignedData?.map((content) => (
                    <LessonList
                      key={content.id}
                      id={id}
                      content={content}
                      openList={openList}
                      toggleList={toggleList}
                      setOpenList={setOpenList}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
          )}
        </ScrollArea>
      </div>

      {/* Right: Available Lessons */}
      <div
        className={`${availableLessons ? "hidden" : "col-span-12 lg:col-span-4 "}`}
      >
        <AvailableLessonsComponent
          id={id}
          assignedData={assignedData}
          setIsWaiting={setIsWaiting}
        />
      </div>
    </div>
  );
}
