import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { de } from "react-day-picker/locale"
import { type DateRange } from "react-day-picker"

function DayClick(day: Date) {
  console.log("Day:", day);
  
}

export function CalendarView() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  )
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: new Date(2025, 5, 17),
      to: new Date(2025, 5, 20),
  })

  const [month, setMonth] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col items-center justify-center mb-5 " id="calendar">
      <Calendar
        mode="single"
        selected={date}
        locale={de}
        disabled={{ dayOfWeek: [0, 6] }}
        onSelect={setDate} 
        onDayClick={DayClick}
        className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(30)]"
        buttonVariant="ghost"
      />
    </div>
  )
}