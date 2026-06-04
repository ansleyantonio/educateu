/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import LessonDetails from "./lessonDetails";

const LessonList = ({ moduleLessons }: { moduleLessons: any[] }) => {
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const toggleLesson = (value: string) => {
    setOpenLesson((prev) => (prev === value ? null : value));
  };

  return (
    <div className="flex flex-col ml-2">
      <Accordion
        type="single"
        collapsible
        value={openLesson ?? undefined}
        onValueChange={setOpenLesson}
      >
        {moduleLessons?.map((lesson: any, i: number) => {
          const { id, title, lessonContents, outcome } = lesson?.lesson;
          const lessonValue = `lesson-${id}`;
          const active = openLesson === lessonValue;
          const isLastItem = i === moduleLessons.length - 1;

          // console.log("LessonList Data", lesson);

          return (
            <AccordionItem
              className={`${isLastItem ? "border-b-0" : "border-b-2"}`}
              key={id}
              value={lessonValue}
            >
              <div
                className="flex gap-4 items-center py-2 cursor-pointer"
                onClick={() => toggleLesson(lessonValue)}
              >
                <ChevronDown
                  strokeWidth={3}
                  size={22}
                  className={`text-muted-foreground transition-transform ${
                    active ? "rotate-180" : ""
                  }`}
                />
                <div className="flex flex-col">
                  <p>{title}</p>
                  <p className="text-xs text-muted-foreground">{outcome}</p>
                </div>
              </div>

              <AccordionContent className="pl-8 mt-2">
                <LessonDetails contents={lessonContents} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default LessonList;
