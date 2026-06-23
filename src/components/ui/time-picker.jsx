import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function TimePicker({ label, value, onChange }) {
  const times = []

  for (let hour = 1; hour <= 12; hour++) {
    for (let minute of ["00", "30"]) {
      for (let period of ["AM", "PM"]) {
        const formatted = `${hour.toString().padStart(2, "0")}:${minute} ${period}`
        times.push(formatted)
      }
    }
  }

  return (
    <div className="flex flex-col space-y-1">
      {label && <Label>{label}</Label>}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {times.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
