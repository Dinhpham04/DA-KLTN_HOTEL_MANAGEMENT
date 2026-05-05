import DashboardHeader from '@/components/common/dashboard/DashboardHeader'
import DashboardManagementTabs from '@/components/common/dashboard/DashboardManagementTabs'
import { createFileRoute } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function readDateFromUrl(key: string): Date {
  if (typeof window === 'undefined') return new Date()
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(key)
  if (!raw) return new Date()
  const parsed = dayjs(raw, 'YYYY/MM/DD', true)
  return parsed.isValid() ? parsed.toDate() : new Date()
}

function syncUrlParam(key: string, value: Date) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(key, dayjs(value).format('YYYY/MM/DD'))
  window.history.replaceState({}, '', url.toString())
}

function readTabFromUrl() {
  if (typeof window === 'undefined') return 'daily-reserve'
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('tab')
  return raw === 'exit-management' ? raw : 'daily-reserve'
}

function syncTextUrlParam(key: string, value: string) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(key, value)
  window.history.replaceState({}, '', url.toString())
}

function DashboardPage() {
  const [headerDate, setHeaderDate] = useState<Date>(() => readDateFromUrl('date1'))
  const [taskDate, setTaskDate] = useState<Date>(() => readDateFromUrl('date2'))
  const [selectedTab, setSelectedTab] = useState<string>(() => readTabFromUrl())

  const handleHeaderDateChange = (date: Date) => {
    setHeaderDate(date)
    syncUrlParam('date1', date)
  }

  const handleTaskDateChange = (date: Date) => {
    setTaskDate(date)
    syncUrlParam('date2', date)
  }

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    syncTextUrlParam('tab', tab)
  }

  return (
    <div>
      <DashboardHeader
        date={headerDate}
        onDateChange={handleHeaderDateChange}
        taskDate={taskDate}
      />
      <DashboardManagementTabs
        date={taskDate}
        onDateChange={handleTaskDateChange}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
