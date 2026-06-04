import type { Interview } from "./interview"

export interface CalendarDay {
  day: number
  name: string
  weekday: number
  monthName: string
  year: number
  dateString: string
  interviews?: Interview[]
}
