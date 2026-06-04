/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { moduleListAPI } from "@/components/json/fakeApi";
import { Accordion } from "@/components/ui/custom_ui/course-accordion";
import { useState } from "react";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ModuleList from "./module/moduleList";
import { DndContext } from "@dnd-kit/core";
import AvailableModulesComponent from "./module/available_modules";
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";

export default function AssignLessonTab() {
  const [data, setData] = useState(moduleListAPI);
  const [openModule, setOpenModule] = useState<string | null>(null);

  const toggleModule = (value: string) => {
    setOpenModule((prev) => (prev === value ? null : value));
  };

  const handleSortableDrag = ({ active, over }: { active: any; over: any }) => {
    if (over && active?.id !== over?.id) {
      setData((item) => {
        const oldIndex = item.findIndex((item) => item.id === active.id);
        const newIndex = item.findIndex((item) => item.id === over.id);
        return arrayMove(item, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 pt-3 w-full">
      {/* Module Sorting List and Details */}
      <div className="col-span-12 lg:col-span-8">
        <DndContext
          onDragStart={() => {
            setOpenModule(null);
          }}
          onDragEnd={handleSortableDrag}
          modifiers={[
            restrictToVerticalAxis,
            restrictToFirstScrollableAncestor,
          ]}
        >
          <SortableContext items={data} strategy={verticalListSortingStrategy}>
            <Accordion
              type="single"
              collapsible
              value={openModule ?? undefined}
              onValueChange={setOpenModule}
            >
              {data?.map((modules, i) => (
                <ModuleList
                  key={i}
                  openModule={openModule}
                  toggleModule={toggleModule}
                  setOpenModule={setOpenModule}
                  modules={modules}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      </div>

      {/* Available Module with Search */}
      <div className="col-span-12 lg:col-span-4">
        <AvailableModulesComponent data={data} />
      </div>
    </div>
  );
}
