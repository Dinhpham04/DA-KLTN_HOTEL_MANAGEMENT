import type { Option } from '@/components/common/CustomSelectClean'

// ─── Area Options (Mock - API chưa triển khai) ──────────────────────
export const MOCK_AREA_OPTIONS: Option[] = [
  { label: 'Khu vực 1', value: '1' },
  { label: 'Khu vực 2', value: '2' },
  { label: 'Khu vực 3', value: '3' },
]

// ─── Keybox Options (Mock) ───────────────────────────────────────────
export const MOCK_KEYBOX_OPTIONS: Option[] = [
  { label: 'Box A', value: 'a' },
  { label: 'Box B', value: 'b' },
  { label: 'Box C', value: 'c' },
  { label: 'Box D', value: 'd' },
  { label: 'Box E', value: 'e' },
  { label: 'Box F', value: 'f' },
]

// ─── Data Type (Loại khách hàng) ────────────────────────────────────
export const DATA_TYPE_OPTIONS = [
  { id: '1', value: '1', name: 'Cá nhân' },
  { id: '2', value: '2', name: 'Doanh nghiệp' },
  { id: '3', value: '3', name: 'DN đặc biệt' },
]

// ─── Sex (Giới tính) ────────────────────────────────────────────────
export const SEX_OPTIONS = [
  { id: '1', value: '1', name: 'Nam' },
  { id: '2', value: '2', name: 'Nữ' },
  { id: '9', value: '9', name: 'Khác' },
]

// ─── Confirm Flag ───────────────────────────────────────────────────
export const CONFIRM_FLAG_OPTIONS: Option[] = [
  { label: 'Chưa xác định', value: '0' },
  { label: 'Đã xác nhận', value: '1' },
]

// ─── Direct Checkin Type ────────────────────────────────────────────
export const DIRECTCHECKIN_TYPE_OPTIONS = [
  { id: '1', value: '1', name: 'Đến trực tiếp' },
  { id: '2', value: '2', name: 'Tòa nhà 6' },
  { id: '3', value: '3', name: 'D/I' },
  { id: '4', value: '4', name: 'YCAT' },
  { id: '5', value: '5', name: 'Giao phòng' },
]

// ─── Advertising Type ───────────────────────────────────────────────
export const ADVERTISING_TYPE_OPTIONS = [
  { id: '0', value: '0', name: 'Không' },
  { id: '1', value: '1', name: 'Khách quen' },
  { id: '2', value: '2', name: 'Walk-in' },
  { id: '3', value: '3', name: 'Trang chủ' },
  { id: '4', value: '4', name: 'Rakuten' },
  { id: '5', value: '5', name: 'English Site' },
  { id: '9', value: '9', name: 'Khác' },
]

// ─── Used Messy Level ───────────────────────────────────────────────
export const USED_MESSY_LEVEL_OPTIONS: Option[] = [
  { label: 'Bình thường', value: '0' },
  { label: 'Bẩn', value: '1' },
]

// ─── From 1 to 50 ──────────────────────────────────────────────────
export const FROM_1_TO_50_OPTIONS: Option[] = Array.from({ length: 50 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}))

// ─── Rental Keys Options (0-6) ──────────────────────────────────────
export const RENTAL_KEYS_OPTIONS: Option[] = Array.from({ length: 7 }, (_, i) => ({
  label: String(i),
  value: String(i),
}))

// ─── Time Extension (1-11) ──────────────────────────────────────────
export const TIME_EXTENSION_OPTIONS: Option[] = Array.from({ length: 11 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}))

// ─── Delete Status ──────────────────────────────────────────────────
export const DELETE_STATUS_OPTIONS: Option[] = [
  { label: 'Đăng ký nhầm', value: '1' },
  { label: 'Hủy', value: '2' },
  { label: 'No-Show', value: '3' },
]

// ─── Billing Table Headers (Mock) ───────────────────────────────────
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

export const OCCUPIER_HEADERS = [
  'Họ tên',
  'Ngày sinh',
  'Tuổi',
  'Giới tính',
  'Địa chỉ',
  'SĐT',
  'Thao tác',
]
