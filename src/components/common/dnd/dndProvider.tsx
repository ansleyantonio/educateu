"use client";

import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { ReactNode } from "react";

interface DndProviderProps<T> {
  data: T[];
  children: ReactNode;
  handleSortableDrag?: (event: DragEndEvent) => void;
  handleDragStart?: (event: DragStartEvent) => void;
}

// This provider is make for reuse the DndContext and SortableContext
const DndProvider = <T extends { id: string | number }>({
  data,
  children,
  handleSortableDrag,
  handleDragStart,
}: DndProviderProps<T>) => {
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleSortableDrag}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
    >
      <SortableContext items={data} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DndProvider;
