/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IAssignedModule } from "@/app/admin/course-management/courses/_assets/types/assigned_module";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
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
import ModuleList from "./moduleList";

export default function AssignedModuleComponent({
  module,
  id,
}: {
  module: any;
  id: string;
}) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [openList, setOpenList] = useState<string | null>(null);
  const [assignedData, setAssignedData] = useState<any[]>([]);
  const previousDataRef = useRef<IAssignedModule[]>([]);
  const queryClient = useQueryClient();

  // console.log("Test ModuleList", module);
  // console.log("Test AssignedData", assignedData);

  // Toggle accordion
  const toggleList = (value: string) => {
    setOpenList((prev) => (prev === value ? null : value));
  };

  // Sync data from API into local state and sort by index
  useEffect(() => {
    if (Array.isArray(module)) {
      const sortedModules = [...module].sort((a, b) => a.index - b.index);
      setAssignedData(sortedModules);
      previousDataRef.current = sortedModules;
    }
  }, [module]);

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
    const updates: { moduleId: string; index: number }[] = [];

    newItems.forEach((module: IAssignedModule, arrayIndex) => {
      const newPosition = arrayIndex + 1;
      const currentPosition = module.index;

      // Include in update list only if index changed
      if (newPosition !== currentPosition) {
        updates.push({
          moduleId: module?.id,
          index: newPosition,
        });
        console.log(
          `UPDATE: ${module.title} from ${currentPosition} to ${newPosition}`
        );
      }
    });
    console.log("Final updates to send:", updates);

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
        queryKey: [`get-semester-modules`],
      });
    },
    onError: (error) => {
      showToast("error", error);
      setIsWaiting(false);
    },
  });

  return (
    <ScrollArea className="max:h-[calc(100vh-250px)]">
      {isWaiting ? (
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
  );
}
