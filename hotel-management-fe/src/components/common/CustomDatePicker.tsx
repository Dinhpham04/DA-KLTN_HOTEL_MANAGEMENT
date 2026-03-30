import { cn } from '@/lib/utils'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import DateTimePicker, { type DateTimePickerProps } from 'react-datetime-picker'
import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import type { LooseValue } from '@/dom'

type TypeDatePicker = DateTimePickerProps & {
  format?: string
  change?: (e: Date | Date[] | null) => void
  value?: Date | null | string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onClick?: (e: unknown) => void
  className?: string
  classNameWrapper?: string
  disable?: boolean
  isShow?: boolean
  portalContainer?: HTMLElement
  monthOnly?: boolean
  defaultActiveStartDate?: Date
}

const CustomDatePicker: React.FC<TypeDatePicker> = ({
  format = 'y/MM/dd',
  change,
  value,
  onBlur,
  onClick,
  className,
  isShow = false,
  disable = false,
  portalContainer = null,
  calendarProps,
  classNameWrapper,
  monthOnly = false,
  defaultActiveStartDate,
  ...otherProp
}) => {
  const locale = 'vi-VN'
  const [dateTime, setDateTime] = useState<LooseValue>()
  const [calendarView, setCalendarView] = useState<'century' | 'decade' | 'year' | 'month'>(
    monthOnly ? 'year' : 'month'
  )
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(defaultActiveStartDate)
  const [isCalendarOpen, setIsCalendarOpen] = useState(isShow)

  const pickerRef = useRef<HTMLDivElement>(null)

  const handleDateChange = (newDate: Date | null) => {
    setDateTime(newDate)
    if (change) {
      change(newDate)
    }
  }

  useEffect(() => {
    if (value) {
      setDateTime(value)
    } else {
      setDateTime(null)
    }
  }, [value])

  useEffect(() => {
    setIsCalendarOpen(isShow)
  }, [isShow])

  useEffect(() => {
    if (value) {
      const dateValue = value instanceof Date ? value : new Date(value)

      if (defaultActiveStartDate && dateValue < defaultActiveStartDate) {
        setActiveStartDate(defaultActiveStartDate)
      } else {
        setActiveStartDate(dateValue)
      }
    } else if (defaultActiveStartDate) {
      setActiveStartDate(defaultActiveStartDate)
    }
  }, [defaultActiveStartDate, value])

  useEffect(() => {
    const yearEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__year')
    const monthEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__month')
    const dayEl = pickerRef.current?.querySelector('.react-datetime-picker__inputGroup__day')

    const openCalendar = () => {
      setIsCalendarOpen(true)
    }

    const handleYearClick = () => {
      setCalendarView('decade')
      openCalendar()
    }

    const handleMonthClick = () => {
      setCalendarView('year')
      openCalendar()
    }

    const handleDayClick = () => {
      setCalendarView('month')
      openCalendar()
    }

    yearEl?.addEventListener('click', handleYearClick)
    monthEl?.addEventListener('click', handleMonthClick)
    dayEl?.addEventListener('click', handleDayClick)

    return () => {
      yearEl?.removeEventListener('click', handleYearClick)
      monthEl?.removeEventListener('click', handleMonthClick)
      dayEl?.removeEventListener('click', handleDayClick)
    }
  }, [])

  const handleCalendarOpen = () => {
    setIsCalendarOpen(true)
    setTimeout(() => {
      const calendar = document.querySelector('.react-datetime-picker__calendar--open')
      if (calendar) {
        calendar.querySelectorAll('button, input, a, [tabindex]').forEach((el) => {
          el.setAttribute('tabindex', '-1')
        })
      }
    }, 100)
  }

  const handleCalendarClose = () => {
    setCalendarView(monthOnly ? 'year' : 'month')
    setIsCalendarOpen(false)
  }

  // Handle year selection - update year and continue to month selection
  const handleYearSelect = (selectedDate: Date) => {
    const currentDate = dateTime instanceof Date ? dateTime : new Date()
    const newDate = new Date(currentDate)
    newDate.setFullYear(selectedDate.getFullYear())
    handleDateChange(newDate)
    // Continue to month selection view
    setCalendarView('year')
  }

  // Handle month selection - update month and continue to day selection
  const handleMonthSelect = (selectedDate: Date) => {
    const currentDate = dateTime instanceof Date ? dateTime : new Date()
    const newDate = new Date(currentDate)
    newDate.setFullYear(selectedDate.getFullYear())
    newDate.setMonth(selectedDate.getMonth())
    handleDateChange(newDate)
    // Continue to day selection view
    setCalendarView('month')
  }

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const calendar = document.querySelector('.react-datetime-picker__calendar--open')
          if (calendar) {
            const buttons = calendar.querySelectorAll('button, a, input')
            for (const button of buttons) {
              button.setAttribute('tabindex', '-1')
            }
          }
        }
      }
    })

    if (pickerRef.current) {
      observer.observe(pickerRef.current, {
        childList: true,
        subtree: true,
      })
    }

    return () => observer.disconnect()
  }, [])

  const vietnameseMonths = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]

  return (
    <div ref={pickerRef} className={cn(classNameWrapper)}>
      <DateTimePicker
        onBlur={onBlur}
        disabled={disable}
        locale={locale}
        format={format}
        dayPlaceholder="DD"
        onClick={onClick}
        maxDate={otherProp.maxDate}
        minDate={otherProp.minDate}
        portalContainer={portalContainer}
        calendarProps={{
          ...calendarProps,
          maxDetail: monthOnly ? 'year' : undefined,
          defaultView: monthOnly ? 'year' : 'decade',
          view: calendarView,
          onViewChange: (view) => setCalendarView(view.view),
          activeStartDate: activeStartDate,
          onActiveStartDateChange: ({ activeStartDate }) =>
            setActiveStartDate(activeStartDate || undefined),
          onClickYear: handleYearSelect,
          onClickMonth: handleMonthSelect,
          formatShortWeekday: (_locale, date) => {
            const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
            return weekdays[date.getDay()]
          },
          formatMonthYear: (_locale, date) => {
            const month = vietnameseMonths[date.getMonth()]
            const year = date.getFullYear()
            return `${month} ${year}`
          },
          formatMonth: (_locale, date) => {
            return vietnameseMonths[date.getMonth()]
          },
          formatYear: (_locale, date) => {
            return `${date.getFullYear()}`
          },
        }}
        disableClock
        monthPlaceholder="MM"
        yearPlaceholder="YYYY"
        clearIcon={false}
        calendarIcon={false}
        className={cn(
          'z-1000 flex-1 bg-white [&>div]:px-4 border-[1px] font-bold border-black w-[19rem] h-16 [&_input::placeholder]:text-black text-2xl text-center cursor-pointer react-date-picker__calendar-button',
          disable ? 'disabled' : '',
          className
        )}
        onChange={handleDateChange}
        isCalendarOpen={isCalendarOpen}
        value={dateTime}
        onCalendarOpen={handleCalendarOpen}
        onCalendarClose={handleCalendarClose}
        {...otherProp}
      />
    </div>
  )
}

export default CustomDatePicker
