import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import DateTimePicker from 'react-datetime-picker'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import 'react-datetime-picker/dist/DateTimePicker.css'
import { Button } from '../ui/button'

export interface TypeDatePicker {
  format?: string
  change?: (e: Date | null) => void
  value?: Date | null
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onClick?: (e: unknown) => void
  className?: string
  disable?: boolean
  hiddenNextMoth?: boolean
  classNameButton?: string
  portalContainer?: HTMLElement | null
}

const now = new Date()

const CustomDatePickerNextDay: React.FC<TypeDatePicker> = ({
  format = 'y/MM/dd',
  change,
  value = now,
  onBlur,
  onClick,
  className,
  hiddenNextMoth = false,
  disable = false,
  classNameButton,
  portalContainer = null,
}) => {
  const [dateTime, setDateTime] = useState<Date | null>(value)
  const [calendarView, setCalendarView] = useState<'century' | 'decade' | 'year' | 'month'>('month')
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleDateChange = (newDate: Date | null) => {
    setDateTime(newDate)
    change?.(newDate)
  }

  const adjustDate = (amount: number, unit: 'days' | 'months') => {
    if (!dateTime) return
    const newDate = new Date(dateTime)
    if (unit === 'days') newDate.setDate(newDate.getDate() + amount)
    if (unit === 'months') newDate.setMonth(newDate.getMonth() + amount)
    handleDateChange(newDate)
  }

  useEffect(() => {
    setDateTime(value ?? null)
  }, [value])

  useEffect(() => {
    const yearEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__year')
    const monthEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__month')
    const dayEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__day')

    const openCalendar = () => {
      const icon = pickerRef.current?.querySelector('.react-datetime-picker__button')
      if (icon instanceof HTMLElement) {
        icon.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      }
    }

    const onYear = () => {
      setCalendarView('decade')
      openCalendar()
    }
    const onMonth = () => {
      setCalendarView('year')
      openCalendar()
    }
    const onDay = () => {
      setCalendarView('month')
      openCalendar()
    }

    yearEl?.addEventListener('click', onYear)
    monthEl?.addEventListener('click', onMonth)
    dayEl?.addEventListener('click', onDay)

    return () => {
      yearEl?.removeEventListener('click', onYear)
      monthEl?.removeEventListener('click', onMonth)
      dayEl?.removeEventListener('click', onDay)
    }
  }, [])

  return (
    <div className="flex items-center" ref={pickerRef}>
      {!hiddenNextMoth && (
        <Button
          type="button"
          className="flex justify-center items-center bg-gray-100 p-2 border border-black w-[4rem] h-16 !rounded-none text-black"
          onClick={() => adjustDate(-1, 'months')}
        >
          <ChevronsLeft className="w-[1.6rem] h-[1.6rem]" />
        </Button>
      )}
      <Button
        type="button"
        className={cn(
          'p-2 bg-gray-100 w-[4rem] h-16 border-y border-black flex items-center justify-center !rounded-none text-black',
          classNameButton,
          hiddenNextMoth && 'border-l'
        )}
        onClick={() => adjustDate(-1, 'days')}
      >
        <ChevronLeft className="w-[1.6rem] h-[1.6rem]" />
      </Button>
      <div className={cn('flex-1 h-16 border border-black bg-white', disable && 'bg-[#D9D9D9]')}>
        <DateTimePicker
          onBlur={onBlur}
          disabled={disable}
          locale="vi-VN"
          format={format}
          dayPlaceholder="dd"
          onClick={onClick}
          portalContainer={portalContainer}
          onCalendarClose={() => setCalendarView('month')}
          calendarProps={{
            view: calendarView,
            onViewChange: (view) => setCalendarView(view.view),
            formatShortWeekday: (_locale, date) => {
              const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
              return weekdays[date.getDay()]
            },
          }}
          disableClock
          monthPlaceholder="mm"
          yearPlaceholder="yyyy"
          clearIcon={false}
          calendarIcon={false}
          className={cn(
            'w-full h-full text-2xl react-date-picker__calendar-button font-semibold cursor-pointer text-center text-black bg-transparent [&>div]:px-4 [&_input]:text-black [&_input::placeholder]:text-black [&_.react-datetime-picker__wrapper]:border-0 [&_.react-datetime-picker__wrapper]:rounded-none [&_.react-datetime-picker__wrapper]:bg-transparent',
            disable && 'cursor-not-allowed',
            className
          )}
          onChange={handleDateChange}
          value={dateTime}
        />
      </div>
      <Button
        type="button"
        className={cn(
          'p-2 bg-gray-100 w-[4rem] h-16 border-y border-black flex items-center justify-center !rounded-none text-black',
          classNameButton,
          hiddenNextMoth && 'border-r'
        )}
        onClick={() => adjustDate(1, 'days')}
      >
        <ChevronRight className="w-[1.6rem] h-[1.6rem]" />
      </Button>
      {!hiddenNextMoth && (
        <Button
          type="button"
          className="flex justify-center items-center bg-gray-100 p-2 border border-black w-[4rem] h-16 !rounded-none text-black"
          onClick={() => adjustDate(1, 'months')}
        >
          <ChevronsRight className="w-[1.6rem] h-[1.6rem]" />
        </Button>
      )}
    </div>
  )
}

export default CustomDatePickerNextDay
