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
import { useEffect, useRef, useState } from "react";
import AvailableModulesComponent from "./modules/assignable_modules";
import ModuleList from "./modules/moduleList";
import { IAssignedModule } from "../../../types/assigned_module";
import AssignedProgressStatus from "@/app/admin/course-management/_assets/components/assignedProgressStatus";

// Main Component
export default function AssignModuleTab({
  id,
  type,
}: {
  id: string;
  type?: string;
}) {
  const { data, isLoading } = useFetchData({
    path: `courses/${id}/assigned-modules`,
    queryKey: `fetch_courses_assigned_modules`,
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);
  const [assignedData, setAssignedData] = useState<IAssignedModule[]>([]);
  const previousDataRef = useRef<IAssignedModule[]>([]);
  const queryClient = useQueryClient();

  // Toggle accordion
  const toggleList = (value: string) => {
    setOpenList((prev) => (prev === value ? null : value));
  };

  // Sync data from API into local state and sort by index
  useEffect(() => {
    if (data?.data?.assignedModules) {
      setAssignedData(data?.data?.assignedModules);
      previousDataRef.current = data.data.assignedModules;
    }
  }, [data]);

  // Handle drag-and-drop sorting
  const handleSortableDrag = (event: DragEndEvent) => {
    // Exit early if no target or dropped on itself
    const { active, over } = event;
    if (!over || active?.id === over?.id) return;

    // Find old and new index of the dragged item
    const oldIndex = assignedData.findIndex((item) => item?.id === active?.id);
    const newIndex = assignedData.findIndex((item) => item?.id === over?.id);

    // Rearrange items using the new index positions
    if (oldIndex === -1 || newIndex === -1) return;

    // Rearrange items using the new index positions
    const newItems = arrayMove(assignedData, oldIndex, newIndex);

    // Prepare update payload for items whose position has changed
    const updates: { moduleId: string; index: number }[] = [];

    newItems?.forEach((module: IAssignedModule, arrayIndex) => {
      const newPosition = arrayIndex + 1;
      const currentPosition = module.index;

      // Include in update list only if index changed
      if (newPosition !== currentPosition) {
        updates.push({
          moduleId: module?.id,
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
      setIsWaiting(true);
      updateLessonIndexesMuted.mutate(updates);
    }
  };

  // Send reordered lessons to backend
  const updateLessonIndexesMuted = useApiMutation({
    safe: false,
    path: `courses/${id}/update-module-index`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data);
      setIsWaiting(false);
      queryClient.invalidateQueries({
        queryKey: [`course-modules/${id}/assigned-lessons`],
      });
    },
  });

  return (
    <div className="grid grid-cols-12 gap-3 pt-3 w-full">
      {/* Left: Assigned Module */}
      <div className="col-span-12 lg:col-span-8">
        {type && (
          <AssignedProgressStatus
            title="Assigned Module"
            type={type}
            total={data?.meta?.courseTotalMinutes}
            assigned={data?.meta?.courseAssignedTotalMinutes}
          />
        )}

        <ScrollArea className="h-[calc(100vh-250px)]">
          {isLoading || isWaiting ? (
            <div className="flex justify-center items-center mt-16 h-64">
              <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            </div>
          ) : assignedData?.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-2 text-gray-400">📦</div>
                <div className="text-gray-500">No modules assigned yet</div>
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
                  {assignedData?.map((module) => (
                    <ModuleList
                      key={module?.id}
                      id={id}
                      module={module}
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
      <div className="col-span-12 lg:col-span-4">
        <AvailableModulesComponent id={id} assignedData={assignedData} />
      </div>
    </div>
  );
}
