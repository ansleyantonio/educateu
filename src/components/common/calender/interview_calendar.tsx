"use client";

import { useState } from "react";
import {
  CalendarDay,
  InterviewListDialog,
} from "@/components/common/dialog/InterviewList/InterviewListDialog";
import dateFormat from "@/utils/DateFormatter";

type CalendarData = {
  month: string;
  year: number;
  days: CalendarDay[];
};

type InterviewCalendarProps = {
  data: {
    calender: CalendarData;
  };
  refetch: () => void;
};

export function InterviewCalendar({ data }: InterviewCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calendar = data?.calender;

  //Colors
  const getLighterColor = (color: string) => {
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  return (
    <div className="rounded-lg border shadow-sm">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 bg-muted/50">
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day) => (
          <div
            key={day}
            className="p-3 text-sm font-medium text-center border truncate text-ellipsis"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendar?.days.map((day, index) => {
          const isCurrentMonth =
            day.monthName.toLowerCase() === calendar.month.toLowerCase();
          const interviews = day.interviews ?? [];
          const hasInterviews = interviews.length > 0;
          const mainColor = hasInterviews ? interviews[0].color : "";
          const bgColor = hasInterviews ? getLighterColor(mainColor) : "";

          return (
            <div
              key={index}
              onClick={isCurrentMonth ? () => handleDayClick(day) : undefined}
              className={`min-h-[120px] p-2 border relative transition-colors ${
                isCurrentMonth
                  ? "cursor-pointer hover:bg-muted/30"
                  : "cursor-not-allowed text-muted-foreground bg-muted/60"
              }`}
              style={
                hasInterviews && isCurrentMonth
                  ? { backgroundColor: bgColor }
                  : {}
              }
            >
              <div className="mb-2 text-right">{day.day}</div>

              {hasInterviews && isCurrentMonth && (
                <div className="space-y-1">
                  {interviews.slice(0, 1).map((interview, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden absolute bottom-3 p-1 text-xs rounded text-ellipsis"
                      style={{ color: interview.color }}
                    >
                      <div className="hidden lg:block">
                        <span>
                          {" "}
                          {dateFormat.fullDateTime(interview.interviewDate, {
                            showTime: false,
                          })}{" "}
                          at{" "}
                        </span>
                        <span>
                          {dateFormat.time12h(interview?.startTime, {
                            local: true,
                          })}{" "}
                          -{" "}
                          {dateFormat.time12h(interview.endTime, {
                            local: true,
                          })}
                        </span>
                      </div>

                      <div className="w-full xl:max-w-full max-w-[30px] lg:max-w-[90px]">
                        <p className="truncate">{interview.applicant}</p>
                      </div>
                    </div>
                  ))}

                  {interviews.length > 1 && (
                    <strong className="absolute bottom-0 right-2 text-xs text-muted-foreground">
                      +{interviews.length - 1}
                    </strong>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interview Detail Modal */}
      <InterviewListDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        interviewData={selectedDay}
      />
    </div>
  );
}
