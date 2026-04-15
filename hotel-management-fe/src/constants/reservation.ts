import type { Option } from '@/components/common/CustomSelectClean'
import { DataType, Sex, UsedMessyLevel } from '@/constants/common'

export const MOCK_AREA_OPTIONS: Option[] = [
  { label: 'Khu vực 1', value: '1' },
  { label: 'Khu vực 2', value: '2' },
  { label: 'Khu vực 3', value: '3' },
]

export const MOCK_KEYBOX_OPTIONS: Option[] = [
  { label: 'Box A', value: 'a' },
  { label: 'Box B', value: 'b' },
  { label: 'Box C', value: 'c' },
  { label: 'Box D', value: 'd' },
  { label: 'Box E', value: 'e' },
  { label: 'Box F', value: 'f' },
]

export const DATA_TYPE_OPTIONS = [
  { id: '1', value: '1', name: DataType[1] },
  { id: '2', value: '2', name: DataType[2] },
  { id: '3', value: '3', name: DataType[3] },
]

export const SEX_OPTIONS = [
  { id: String(Sex.Nam), value: String(Sex.Nam), name: Sex[Sex.Nam] },
  { id: String(Sex.Nữ), value: String(Sex.Nữ), name: Sex[Sex.Nữ] },
  { id: String(Sex.Khác), value: String(Sex.Khác), name: Sex[Sex.Khác] },
]

export const CONFIRM_FLAG_OPTIONS: Option[] = [
  { label: 'Chưa xác nhận', value: '0' },
  { label: 'Đã xác nhận', value: '1' },
]

export const DIRECTCHECKIN_TYPE_OPTIONS = [
  { id: '1', value: '1', name: 'Trực tiếp tại quầy lễ tân' },
  { id: '2', value: '2', name: 'Tự check-in (mã khóa/hộp khóa)' },
  { id: '3', value: '3', name: 'Bàn giao trực tiếp (Meet & Greet)' },
]

export const ADVERTISING_TYPE_OPTIONS = [
  { id: '1', value: '1', name: 'Khách quay lại/giới thiệu' },
  { id: '2', value: '2', name: 'Walk-in' },
  { id: '3', value: '3', name: 'Website chính thức' },
  { id: '4', value: '4', name: 'OTA' },
  { id: '5', value: '5', name: 'Mạng xã hội' },
  { id: '9', value: '9', name: 'Khác' },
]

export const USED_MESSY_LEVEL_OPTIONS: Option[] = [
  {
    label: UsedMessyLevel[UsedMessyLevel.Sạch],
    value: String(UsedMessyLevel.Sạch),
  },
  {
    label: UsedMessyLevel[UsedMessyLevel.Bẩn],
    value: String(UsedMessyLevel.Bẩn),
  },
]

export const NORESERVE_COUNT_OPTIONS: Option[] = Array.from({ length: 50 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

export const RENTAL_KEYS_OPTIONS: Option[] = Array.from({ length: 7 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

export const TIME_EXTENSION_OPTIONS: Option[] = Array.from({ length: 11 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}))

export const DELETE_STATUS_OPTIONS: Option[] = [
  { label: 'Đăng ký nhầm', value: '1' },
  { label: 'Hủy', value: '2' },
  { label: 'No-Show', value: '3' },
]

export const BILLING_NORMAL_HEADERS = [
  'Hạng mục',
  'Thời gian thanh toán',
  'Số ngày',
  'Đơn giá',
  'Số lượng',
  'Đơn vị',
  'Số tiền',
  'Nhân viên',
  'Thao tác',
]

export const BILLING_ADVANCE_HEADERS = [
  'Nội dung',
  'Phương thức thanh toán',
  'Số tiền',
  'Ngày thanh toán',
  'Thao tác',
]

export const OCCUPIER_HEADERS = ['Họ tên', 'Ngày sinh', 'Tuổi', 'Giới tính', 'Địa chỉ', 'SĐT', 'Thao tác']
