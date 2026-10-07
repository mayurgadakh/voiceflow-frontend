import { addMonths, format, parseISO } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Props = {
  /** Days as yyyy-mm-dd, or an empty string when not set */
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

const toDay = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '')

function label(from: string, to: string) {
  if (!from && !to) return 'Any date'
  const start = from ? format(parseISO(from), 'd MMM yyyy') : 'Start'
  const end = to ? format(parseISO(to), 'd MMM yyyy') : 'now'
  return from && from === to ? start : `${start} to ${end}`
}

export function DateRangePicker({ from, to, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [today] = useState(() => new Date())
  const selected: DateRange | undefined = from || to ? { from: from ? parseISO(from) : undefined, to: to ? parseISO(to) : undefined } : undefined
  const twoMonths = typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-56 justify-start font-normal" aria-label="Choose a date range">
            <CalendarIcon className="text-muted-foreground" />
            <span className={from || to ? '' : 'text-muted-foreground'}>{label(from, to)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={twoMonths ? 2 : 1}
            selected={selected}
            defaultMonth={selected?.from ?? addMonths(today, -1)}
            disabled={{ after: today }}
            onSelect={(range) => {
              onChange(toDay(range?.from), toDay(range?.to))
              // The first click returns the same day as both ends, so wait for a different end day
              if (range?.from && range.to && toDay(range.from) !== toDay(range.to)) setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {(from || to) && (
        <Button variant="ghost" size="icon" className="-ml-1" onClick={() => onChange('', '')} aria-label="Clear dates">
          <X />
        </Button>
      )}
    </div>
  )
}
