type Option = {
  value: string
  label: string
}

interface GymRow {
  facilityName?: string | null
  areaName?: string | null
  mainStaffName?: string | null
  checkStaffName?: string | null
  cleanStatus?: number | null
  comment?: string | null
}

interface Props {
  disabledReason?: string
  cleanGymData?: GymRow[]
  setCleanGymData?: (value: GymRow[]) => void
  dateSearch?: Date
  staffOptions?: Option[]
  staffOptions5?: Option[]
  isLoading?: boolean
  refetch?: () => void
  handleSubmitAll?: () => void
  setPutCleanGymData?: (value: unknown[]) => void
  isGlobalLoading?: boolean
  isReadonly?: boolean
}

const statusLabelMap: Record<number, string> = {
  1: 'Chưa bắt đầu',
  2: 'Đang làm',
  3: 'Tạm dừng',
  4: 'Hoàn thành',
  5: 'Đã kiểm tra',
  6: 'Trả lại',
  7: 'Đã hủy',
}

export function GymCleaningAndDisinfection({
  cleanGymData = [],
  disabledReason = 'Dữ liệu khử khuẩn gym hiện đang chờ tích hợp backend.',
}: Props) {
  return (
    <div className="rounded border border-black overflow-x-auto">
      <table className="border-collapse min-w-[70rem] w-full">
        <thead>
          <tr>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Cơ sở</th>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Khu vực</th>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Phụ trách</th>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Kiểm tra</th>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Trạng thái</th>
            <th className="bg-[#EEEEEE] p-2 border border-black text-left">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {cleanGymData.length > 0 ? (
            cleanGymData.map((row, index) => (
              <tr key={`${row.areaName ?? 'gym'}-${index}`}>
                <td className="p-2 border border-black">{row.facilityName ?? '-'}</td>
                <td className="p-2 border border-black">{row.areaName ?? '-'}</td>
                <td className="p-2 border border-black">{row.mainStaffName ?? '-'}</td>
                <td className="p-2 border border-black">{row.checkStaffName ?? '-'}</td>
                <td className="p-2 border border-black">
                  {statusLabelMap[row.cleanStatus ?? 0] ?? '-'}
                </td>
                <td className="p-2 border border-black">{row.comment ?? '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 border border-black text-center" colSpan={6}>
                {disabledReason}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
