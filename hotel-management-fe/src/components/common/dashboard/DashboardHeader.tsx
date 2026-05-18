import CustomDatePickerNextDay from '@/components/common/CustomDatePickerNextDay'
import CustomDialog from '@/components/common/CustomDialog'
import { CustomInput } from '@/components/common/CustomInput'
import NotificationModal from '@/components/common/NotificationModal'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatAnnouncementCreatedAt,
  getAnnouncementDetailClassName,
  getAnnouncementTitleMeta,
} from '@/constants/announcement'
import { useUpsertResidualRoom } from '@/hooks/mutations/useUpsertResidualRoom'
import { useGetAnnouncement } from '@/hooks/queries/useGetAnnouncement'
import { useGetDailyBusiness } from '@/hooks/queries/useGetDailyBusiness'
import type { DailyBusinessRoomCounts, RoomClassCounts } from '@/types/dashboard-header'
import dayjs from 'dayjs'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

interface DashboardHeaderProps {
  date: Date
  onDateChange: (date: Date) => void
}

// Round to 1 decimal place AFTER all arithmetic to avoid float precision artifacts.
function round1(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 10) / 10
}

const EMPTY_ROOM_COUNTS: DailyBusinessRoomCounts = {
  roomClasses: [],
  totalReserves: 0,
  arrivingRooms: 0,
  departingRooms: 0,
  totalRoomEmptyToday: 0,
  totalRoom: 0,
  emptyRoom: 0,
  formattedCurrentTime: '',
}

export default function DashboardHeader({ date, onDateChange }: DashboardHeaderProps) {
  const { t } = useTranslation()
  const [openNotification, setOpenNotification] = useState(false)
  const [targetRoom, setTargetRoom] = useState(0)

  const formattedDate = dayjs(date).format('YYYY/MM/DD')

  const { data: dailyBusinessData } = useGetDailyBusiness({ date: formattedDate })
  const { data: announcementData } = useGetAnnouncement({
    date: formattedDate,
    page: 1,
    perPage: 20,
  })

  const { mutate: updateResidualRoom, isPending: isPendingResidual } = useUpsertResidualRoom({
    onSuccess: () => toast.success(t('dashboard.header.saveSuccess')),
    onError: () => toast.error(t('common.error')),
  })

  const roomCounts = dailyBusinessData?.businesses.roomCounts ?? EMPTY_ROOM_COUNTS
  const targetResidualRoom = dailyBusinessData?.businesses.targetResidualRoom

  useEffect(() => {
    setTargetRoom(targetResidualRoom?.number ?? 0)
  }, [targetResidualRoom?.number])

  const announcementsToShow = useMemo(
    () => announcementData?.announcements.slice(0, 5) ?? [],
    [announcementData]
  )

  const totalRoom = roomCounts.totalRoom
  const emptyRoomTarget = Math.floor(totalRoom * 0.7)

  // Occupancy rate (%) — round once after the subtraction
  const todayOccupancyRate =
    totalRoom !== 0 ? round1(((totalRoom - roomCounts.totalRoomEmptyToday) / totalRoom) * 100) : 0
  const targetOccupancyRate =
    totalRoom !== 0 && targetResidualRoom
      ? round1(((totalRoom - targetResidualRoom.number) / totalRoom) * 100)
      : 0

  const classRows = roomCounts.roomClasses
  const classCellValue = (data: RoomClassCounts, value: number) =>
    data.countTypeRoom === 0 && value === 0 ? '-' : value
  const sumBy = (
    key: keyof Pick<
      RoomClassCounts,
      | 'countRoomClassEmptyBefore'
      | 'countRoomClassEmptyToday'
      | 'selectedCheckinDate'
      | 'selectedCheckoutDate'
    >
  ) => classRows.reduce((acc, row) => acc + row[key], 0)

  const handleResidualBlur = () => {
    updateResidualRoom({
      date: formattedDate,
      number: Number.isNaN(targetRoom) ? 0 : targetRoom,
    })
  }

  return (
    <div className="bg-[url('/images/background-dashboard.png')] bg-cover bg-no-repeat pt-[2.6rem] pb-[4.8rem]">
      <div className="common-container">
        <div className="before:content-[''] flex h-[4.7rem] items-center bg-white text-[2.3rem] font-bold before:h-full before:w-[.4rem] before:bg-primary">
          <span className="ml-[1.5rem]">{t('dashboard.header.pageTitle')}</span>
        </div>

        <div className="mt-[2.4rem] flex h-auto flex-wrap items-stretch gap-[1.6rem]">
          {/* Card 1: Announcement */}
          <Card className="w-full min-w-full flex-1 rounded-[0.8rem] border-2 border-primary bg-white px-[2.4rem] pt-[2rem] pb-[.8rem] md:min-w-[45rem]">
            <CardHeader className="p-0 text-[1.8rem] font-bold after:h-[.1rem] after:w-full after:bg-gray-200">
              {t('dashboard.header.announcement')}
            </CardHeader>
            <CardContent className="mt-[2rem] p-0">
              <div className="h-[8.1rem] overflow-hidden">
                {announcementsToShow.length > 0 ? (
                  <table className="w-full text-[1.4rem] leading-[1.2]">
                    <tbody>
                      {announcementsToShow.map((item) => {
                        const titleMeta = getAnnouncementTitleMeta(item.detail)
                        const createdAt = formatAnnouncementCreatedAt(item.createdAt)
                        const detailClassName = getAnnouncementDetailClassName(item.dataStatus)
                        const detail = item.detail ?? ''
                        return (
                          <tr key={`${item.announcementId}-${item.createdAt}`}>
                            <td className="w-[8rem] py-[0.2rem] pr-2 align-top">
                              <span
                                className={`${titleMeta.className} inline-flex h-[2.2rem] min-w-[7rem] items-center justify-center px-2 text-[1.4rem] font-bold`}
                              >
                                {titleMeta.label}
                              </span>
                            </td>
                            <td className="w-[9.5rem] py-[0.2rem] pr-2 align-top font-bold whitespace-nowrap">
                              {createdAt.date}
                              <span className="ml-2">{createdAt.time}</span>
                            </td>
                            <td className={`py-[0.2rem] align-top ${detailClassName}`}>{detail}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <span className="font-bold text-red-600">{t('dashboard.header.noData')}</span>
                )}
              </div>
              <div className="mt-[1rem] flex flex-row-reverse text-[1.4rem] font-bold">
                <button
                  type="button"
                  onClick={() => setOpenNotification(true)}
                  className="flex cursor-pointer items-center text-[#1A3CEF]"
                >
                  {t('dashboard.header.viewAll')}
                  <ChevronDown className="ml-[.5rem] h-[1.6rem] w-[1.6rem]" />
                </button>
                <CustomDialog
                  opened={openNotification}
                  changeOnOpened={setOpenNotification}
                  size="medium"
                  customClass="!h-[85vh] !max-h-[85vh] !mt-[10rem]"
                  customClassContent="!p-0"
                  trigger={<span />}
                  title={t('dashboard.header.announcement')}
                  content={<NotificationModal date={formattedDate} />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Date picker + summary */}
          <div className="flex min-w-full flex-1 flex-col md:min-w-[36rem]">
            <CustomDatePickerNextDay
              change={(value) => onDateChange(value || new Date())}
              value={date}
              format="yyyy/MM/dd"
              className="h-[5.7rem]"
              classNameButton="h-[5.7rem] [&>svg]:w-[2.3rem] [&>svg]:h-[2.3rem]"
              classNameWrapper="h-[5.7rem]"
              hiddenNextMoth
            />
            <Table
              wrapperClassname="mt-[1.3rem] flex-1"
              className="h-full w-full table-fixed text-center text-[1.4rem] font-bold"
            >
              <TableBody>
                <TableRow className="bg-gray-100 hover:bg-gray-100 data-[state=selected]:bg-gray-100">
                  <TableCell
                    className="h-[6.7rem] w-[50%] border border-solid border-primary p-[.6rem] text-center font-bold"
                    colSpan={2}
                  >
                    {t('dashboard.header.totalEmptyRoomsTitle')}
                    <br />
                    {t('dashboard.header.totalEmptyRoomsRange')}
                  </TableCell>
                  <TableCell
                    className="h-[6.7rem] w-[50%] border border-solid border-primary bg-white p-[.6rem] text-center font-bold whitespace-nowrap"
                    colSpan={2}
                  >
                    <span className="text-[2.4rem] text-red-600">{roomCounts.emptyRoom ?? 0}</span>
                    &nbsp;/&nbsp;
                    <span className="text-[1.8rem]">{emptyRoomTarget}</span>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-100 hover:bg-gray-100 data-[state=selected]:bg-gray-100">
                  <TableCell className="h-[6.7rem] w-[25%] border border-solid border-primary p-[.6rem] text-center font-bold">
                    {t('dashboard.header.initialEmptyRooms')}
                  </TableCell>
                  <TableCell className="h-[6.7rem] w-[25%] border border-solid border-primary bg-white p-[.6rem] text-center font-bold leading-tight whitespace-nowrap">
                    <span className="text-[2.4rem] text-red-600">
                      {roomCounts.totalRoomEmptyToday ?? 0}
                    </span>{' '}
                    {/* {t('dashboard.header.rooms')} */}
                    <br />
                    <span className="text-[1.2rem]">【{todayOccupancyRate}%】</span>
                  </TableCell>
                  <TableCell className="h-[6.7rem] w-[25%] border border-solid border-primary p-[.6rem] text-center font-bold">
                    {t('dashboard.header.targetEmptyRooms')}
                  </TableCell>
                  <TableCell className="h-[6.7rem] w-[25%] border border-solid border-primary bg-white p-[.6rem] text-center font-bold leading-tight">
                    <div className="flex items-center justify-center gap-[.5rem]">
                      <CustomInput
                        type="number"
                        min={0}
                        className="h-[3rem] w-[6rem] border-[rgba(0,0,0,.1)] px-1 text-center text-[2rem] text-red-600"
                        value={targetRoom}
                        disabled={isPendingResidual}
                        onChange={(e) => {
                          const num = Number.parseInt(e.target.value)
                          setTargetRoom(Number.isNaN(num) ? 0 : num)
                        }}
                        onBlur={handleResidualBlur}
                      />
                      <span className="text-[1.2rem]">{/* {t('dashboard.header.rooms')} */}</span>
                    </div>
                    <span className="text-[1.2rem]">【{targetOccupancyRate}%】</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Card 3: Class breakdown */}
          <div className="flex w-full min-w-full flex-1 flex-col xl:min-w-[41.5rem]">
            <Table className="w-full table-fixed text-center text-[1.4rem] font-bold">
              <TableHeader>
                <TableRow className="bg-gray-200 hover:bg-gray-200 data-[state=selected]:bg-gray-200">
                  <TableHead className="h-[4.4rem] border border-solid border-primary text-center font-bold">
                    {t('dashboard.header.classColumn')}
                  </TableHead>
                  <TableHead className="h-[4.4rem] border border-solid border-primary text-center font-bold">
                    {t('dashboard.header.previousEmpty')}
                  </TableHead>
                  <TableHead className="h-[4.4rem] border border-solid border-primary text-center font-bold">
                    {t('dashboard.header.checkin')}
                  </TableHead>
                  <TableHead className="h-[4.4rem] border border-solid border-primary text-center font-bold">
                    {t('dashboard.header.checkout')}
                  </TableHead>
                  <TableHead className="h-[4.4rem] border border-solid border-primary text-center font-bold">
                    {t('dashboard.header.currentEmpty')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="border border-solid border-primary bg-white p-[.6rem] text-gray-400"
                    >
                      {t('dashboard.header.noData')}
                    </TableCell>
                  </TableRow>
                )}
                {classRows.map((row) => (
                  <TableRow key={row.roomClassId}>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {row.roomClassName}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {classCellValue(row, row.countRoomClassEmptyBefore)}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {classCellValue(row, row.selectedCheckinDate)}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {classCellValue(row, row.selectedCheckoutDate)}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {classCellValue(row, row.countRoomClassEmptyToday)}
                    </TableCell>
                  </TableRow>
                ))}
                {classRows.length > 0 && (
                  <TableRow>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {t('dashboard.header.total')}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {sumBy('countRoomClassEmptyBefore')}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {sumBy('selectedCheckinDate')}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {sumBy('selectedCheckoutDate')}
                    </TableCell>
                    <TableCell className="border border-solid border-primary bg-white p-[.6rem]">
                      {sumBy('countRoomClassEmptyToday')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}
