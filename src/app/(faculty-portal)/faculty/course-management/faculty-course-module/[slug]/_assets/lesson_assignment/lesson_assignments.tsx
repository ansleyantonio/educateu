/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import AssignedProgressStatus from "@/app/admin/course-management/_assets/components/assignedProgressStatus";
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
import { useEffect, useRef, useState } from "react";
import AvailableLessonsComponent from "../../../_assets/components/assign_lessons/lessons/assignable_lessons";
import LessonList from "../../../_assets/components/assign_lessons/lessons/lessonList";

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
    path: `faculty-course-module/${id}/assigned-lessons`,
    queryKey: "fetch-assigned-lessons",
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);
  const [assignedData, setAssignedData] = useState<Lesson[]>([]);
  const previousDataRef = useRef<Lesson[]>([]);
  const queryClient = useQueryClient();

  // Toggle accordion
  const toggleList = (value: string) => {
    setOpenList((prev) => (prev === value ? null : value));
  };

  // Sync data from API into local state and sort by index
  useEffect(() => {
    if (data?.data?.assignedLessons) {
      setAssignedData(data.data.assignedLessons);
      previousDataRef.current = data.data.assignedLessons;
    }
  }, [data?.data?.assignedLessons]);

  // Handle drag-and-drop sorting
  const handleSortableDrag = (event: DragEndEvent) => {
    // Exit early if no target or dropped on itself
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find old and new index of the dragged item
    const oldIndex = assignedData.findIndex((item) => item.id === active.id);
    const newIndex = assignedData.findIndex((item) => item.id === over.id);

    // Rearrange items using the new index positions
    if (oldIndex === -1 || newIndex === -1) return;

    // Rearrange items using the new index positions
    const newItems = arrayMove(assignedData, oldIndex, newIndex);

    // Prepare update payload for items whose position has changed
    const updates: { lessonId: string; index: number }[] = [];

    newItems.forEach((lesson, arrayIndex) => {
      const newPosition = arrayIndex + 1;
      const currentPosition = lesson.index;

      // Include in update list only if index changed
      if (newPosition !== currentPosition) {
        updates.push({
          lessonId: lesson.id,
          index: newPosition,
        });
        // console.log(`UPDATE: ${lesson.title} from ${currentPosition} to ${newPosition}`);
      }
    });
    // console.log("Final updates to send:", updates);

    // Update local state to reflect new item order
    setAssignedData(newItems);

    // Then call mutate
    if (updates.length > 0) {
      updateLessonIndexesMuted.mutate(updates);
    }
  };

  // Send reordered lessons to backend
  const updateLessonIndexesMuted = useApiMutation({
    safe: false,
    path: `faculty-course-module/${id}/update-lessons-index`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data);
      setIsWaiting(false);
      queryClient.invalidateQueries({
        queryKey: [`course-modules/${id}/assigned-lessons`],
      });
      queryClient.invalidateQueries({
        queryKey: [`fetch-single-diploma-module-details`],
      });
    },
    onError: (error) => {
      showToast("error", error);
      setIsWaiting(false);
    },
  });

  return (
    <div
      className={`w-full ${
        availableLessons ? null : "grid grid-cols-12 gap-3 pt-3 "
      }`}
    >
      {/* Left: Assigned Lessons */}
      <div
        className={`${
          availableLessons ? "w-full" : "col-span-12 lg:col-span-8"
        }`}
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
          {isLoading || isWaiting ? (
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
                  {assignedData?.map((lesson) => (
                    <LessonList
                      key={lesson.id}
                      id={id}
                      lesson={lesson}
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
        className={`${
          availableLessons ? "hidden" : "col-span-12 lg:col-span-4 "
        }`}
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
