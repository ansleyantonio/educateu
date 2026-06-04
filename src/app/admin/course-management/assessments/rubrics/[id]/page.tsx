"use client";
import { useState } from "react";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import RubricSetting, { RubricCriteriaItemMockup } from "./_assets/components/rubricTemplateSetting";
import { useUpdateRubricCriteriaIndex } from "./_assets/hooks/rubricTemplates";
import { useRubricStore } from "../../assessment/[id]/_assets/lib/useRubricStore";
import { showToast } from "@/components/common/TostMessage/customTostMessage";


export default function Rubric({ params }: { params: { id: string } }) {
  const id = params.id;
  const [rubricCriteriaSortingId, setRubricCriteriaSortingId] = useState<string | null>(null);
  const updateRubricCriteriaIndex = useUpdateRubricCriteriaIndex();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log(active);
    if (active.data.current?.panel === "rubric") setRubricCriteriaSortingId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over?.id) {
      if (rubricCriteriaSortingId) {
        updateRubricCriteriaIndex.mutate(
          { index: over.data.current?.index, rubricCriteriaId: rubricCriteriaSortingId }, {
          onSuccess: (data) => {
            console.log(data);
            useRubricStore.getState().moveRubricCriteria(rubricCriteriaSortingId, over.id as string);
            showToast("success", "Rubric criteria moved successfully", undefined, "toast");
          },
          onError: () => {
            console.log("Failed to update question");
            showToast("error", "Failed to update question", undefined, "toast");
          }
        }
        )
      }
    }
    handleDragCancel();
  };

  const handleDragCancel = () => {
    setRubricCriteriaSortingId(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <RubricSetting id={id} />
        <DragOverlay style={{ cursor: "grabbing" }}>
          {rubricCriteriaSortingId &&
            <RubricCriteriaItemMockup criteria={useRubricStore.getState().getCriteria(rubricCriteriaSortingId)} index={useRubricStore.getState().getCriteriaIndex(rubricCriteriaSortingId)} />
          }
        </DragOverlay>
      </DndContext>
    </div>
  );
}
