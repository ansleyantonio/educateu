"use client";
import { useState } from "react";
import { Button } from "@/components/ui/custom_ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { CalendarLoader } from "@/components/common/GlobalLoader/calendarLoader";
import { InterviewCalendar } from "@/components/common/calender/interview_calendar";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";

const CalendarPage = () => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const now = new Date();
  const [month, setMonth] = useState(months[now.getMonth()]);
  const [year, setYear] = useState(now.getFullYear());
  const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);

  const changeMonth = (offset: number) => {
    const index = (months.indexOf(month) + offset + 12) % 12;
    console.log(index);
    setMonth(months[index]);
    if (offset === -1 && index === 11) setYear((y) => y - 1);
    if (offset === 1 && index === 0) setYear((y) => y + 1);
  };

  const handleYearChange = (selectedYear: string) => {
    setYear(+selectedYear);
  };

  const { data, isLoading, refetch } = useFetchData({
    queryKey: "interview-calendar",
    path: `interview/calender`,
    method: "GET",
    filterData: { month, year },
    // enabled: !!month && !!year,
  });

  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: ["interview-calendar", month, year, token],
  //   queryFn: fetchInterviewCalendar,
  //   enabled: !!month && !!year,
  // });

  if (isLoading) return <CalendarLoader />;

  return (
    <PageWithBreadcrumb items={[{ title: "Home" }, { title: "Calendar" }]}>
      <div className="container py-8 mx-auto">
        <h1 className="mb-6 text-2xl font-bold">Interview Calendar</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2 items-center text-xl font-medium capitalize">
              <p>{month}</p>
              <div className="flex gap-4 items-center">
                <Select
                  value={year.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="p-0 text-xl font-medium border-none cursor-pointer focus:border-none active:border-none">
                    <p className="m-0 mr-2">{year}</p>
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {data?.data && <InterviewCalendar data={data.data} refetch={refetch} />}
      </div>
    </PageWithBreadcrumb>
  );
};

export default CalendarPage;
