/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
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
import {
  IContentForm,
  ILessonUpdateForm,
} from "../../../../_assets/schemas/lessonSchema";
import ContentList from "./contentList";
import { Video } from "lucide-react";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

interface ContentSortingTabProps {
  lesson: ILessonUpdateForm & { id?: string };
}

export default function ContentSortingTab({ lesson }: ContentSortingTabProps) {
  const [sortedData, setSortedData] = useState<IContentForm[]>([]);
  const previousDataRef = useRef<IContentForm[]>([]);
  const queryClient = useQueryClient();

  // Sync data from API into local state and sort by index
  useEffect(() => {
    if (lesson?.contents) {
      // Sort by index initially
      const sorted = [...lesson.contents].sort(
        (a, b) => (a.index || 0) - (b.index || 0),
      );
      setSortedData(sorted);
      previousDataRef.current = sorted;
    }
  }, [lesson]);

  // Handle drag-and-drop sorting
  const handleSortableDrag = (event: DragEndEvent) => {
    // Exit early if no target or dropped on itself
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find old and new index of the dragged item
    const oldIndex = sortedData.findIndex((item) => item.id === active.id);
    const newIndex = sortedData.findIndex((item) => item.id === over.id);

    // Rearrange items using the new index positions
    const newItems = arrayMove(sortedData, oldIndex, newIndex);

    // Prepare update payload for items whose position has changed
    const updates: { id: string; index: number }[] = [];

    newItems.forEach((content: IContentForm, arrayIndex) => {
      const newPosition = arrayIndex + 1;
      const currentPosition = content.index;

      // Include in update list only if index changed
      if (newPosition !== currentPosition) {
        updates.push({
          id: content?.id as string,
          index: newPosition,
        });
        // console.log(
        //   `UPDATE: ${lesson.title} from ${currentPosition} to ${newPosition}`,
        // );
      }
    });
    //   console.log("Final updates to send:", updates);

    // Update local state to reflect new item order
    setSortedData(newItems);

    // Then call mutate
    if (updates.length > 0) {
      // console.log("Updates Lesson ContentList", updates);
      updateLessonIndexesMuted.mutate({ id: lesson?.id, contents: updates });
    }
  };

  // Send reordered lessons to backend
  const updateLessonIndexesMuted = useApiMutation({
    method: "PATCH",
    path: "lessons/update",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-lesson-details"],
      });
    },
  });

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {lesson?.title} has ({lesson?.contents?.length}) content
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-235px)]">
        {" "}
        {updateLessonIndexesMuted.isPending ? (
          <div className="flex justify-center items-center mt-16 h-64">
            <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          </div>
        ) : lesson?.contents?.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="flex justify-center mb-2 text-gray-400">
                <Video className="w-8 h-8" />
              </div>
              <div className="text-gray-500">No Content set yet</div>
            </div>
          </div>
        ) : (
          <DndContext
            onDragEnd={handleSortableDrag}
            modifiers={[
              restrictToVerticalAxis,
              restrictToFirstScrollableAncestor,
            ]}
          >
            <SortableContext
              items={sortedData?.map((item) => item.id as string)}
              strategy={verticalListSortingStrategy}
            >
              {lesson?.contents?.map((content) => (
                <ContentList key={content?.id} content={content} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </ScrollArea>
    </div>
  );
}
