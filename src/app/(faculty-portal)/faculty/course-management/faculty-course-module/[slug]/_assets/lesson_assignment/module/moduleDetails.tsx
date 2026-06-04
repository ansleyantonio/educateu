"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import LectureDetails from "../lecture/lectureDetails";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ModuleDetails = ({ modules }: { modules: any }) => {
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const toggleLesson = (value: string) => {
    setOpenLesson((prev) => (prev === value ? null : value));
  };

  return (
    <div className="flex flex-col">
      <Accordion
        type="single"
        collapsible
        value={openLesson ?? undefined}
        onValueChange={setOpenLesson}
      >
        {modules?.lessons?.map((lesson: any, i: number) => {
          const lessonValue = `lesson-${lesson.id}`;
          const active = openLesson === lessonValue;

          return (
            <AccordionItem key={i} value={lessonValue}>
              <div
                className="flex gap-2 items-center py-2 -ml-2 cursor-pointer"
                onClick={() => toggleLesson(lessonValue)}
              >
                <ChevronDown
                  strokeWidth={2}
                  size={18}
                  className={`text-muted-foreground transition-transform ${
                    active ? "rotate-180" : ""
                  }`}
                />
                <div className="flex flex-col">
                  <p>{lesson?.name}</p>
                </div>
              </div>

              <AccordionContent className="pl-6">
                <LectureDetails lectures={lesson?.lectures} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ModuleDetails;
