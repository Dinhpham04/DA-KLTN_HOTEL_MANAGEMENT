import { z } from 'zod'

export const reservationClientSchema = z.object({
  data_type: z.string().default('1'),
  client_id: z.string().optional(),
  client_name: z.string().max(128).optional(),
  company_name: z.string().max(128).optional(),
  contact_name: z.string().max(128).optional(),
  birthday: z.string().optional(),
  sex: z.string().optional(),
  country_id: z.string().optional(),
  zip_code: z.string().optional(),
  address1: z.string().max(256).optional(),
  address2: z.string().max(256).optional(),
  company_zip_code: z.string().optional(),
  company_address1: z.string().max(256).optional(),
  company_address2: z.string().max(256).optional(),
  email: z.string().optional(),
  tel: z.string().optional(),
  tel_phone: z.string().optional(),
  tel_emergency: z.string().optional(),
  emergency_relation: z.string().optional(),
  company_tel: z.string().optional(),
  fax: z.string().optional(),
  use_count: z.string().optional(),
  memo: z.string().max(1024).optional(),
  stay_duration_auto_flag: z.boolean().default(false),
  used_messy_level: z.string().default('0'),
  ug_flag: z.boolean().default(false),
  postpaid_flag: z.boolean().default(false),
  advertising_type: z.boolean().default(false),
})

export type ReservationClientFormValues = z.infer<typeof reservationClientSchema>

export function getReservationClientDefaultValues(): ReservationClientFormValues {
  return {
    data_type: '1',
    client_id: '',
    client_name: '',
    company_name: '',
    contact_name: '',
    birthday: '',
    sex: '',
    country_id: '',
    zip_code: '',
    address1: '',
    address2: '',
    company_zip_code: '',
    company_address1: '',
    company_address2: '',
    email: '',
    tel: '',
    tel_phone: '',
    tel_emergency: '',
    emergency_relation: '',
    company_tel: '',
    fax: '',
    use_count: '0',
    memo: '',
    stay_duration_auto_flag: false,
    used_messy_level: '0',
    ug_flag: false,
    postpaid_flag: false,
    advertising_type: false,
  }
}

const reservationCommonReserveSchema = z.object({
  facility_id: z.string().optional(),
  room_type_id: z.string().optional(),
  room_id: z.string().optional(),
  stay_type_id: z.string().optional(),
  period_from: z.string().optional(),
  period_to: z.string().optional(),
  payment_due_date: z.string().optional(),
  noreserve_count_before: z.string().default('0'),
  noreserve_count_after: z.string().default('0'),
  auto_extend_flag: z.boolean().default(false),
  confirm_flag: z.string().default('1'),
  directcheckin_type: z.string().default('1'),
  advertising_type: z.string().default('0'),
  rental_keys: z.string().default('0'),
  note: z.string().max(1024).optional(),
  overdue_debt_note: z.string().max(1024).optional(),
  disable_reservation: z.boolean().default(false),
  directcheckin_flag: z.boolean().default(false),
  keybox_name: z.string().optional(),
  keybox_password: z.string().optional(),
  di_contact_staff_id: z.string().optional(),
  contacted_flag: z.boolean().default(false),
  checkin_date: z.string().optional(),
  box_usage_period_type: z.string().optional(),
  box_usage_start_date: z.string().optional(),
  box_usage_end_date: z.string().optional(),
})

export type ReservationCommonReserveFormValues = z.infer<typeof reservationCommonReserveSchema>

function getReservationCommonReserveDefaultValues(): ReservationCommonReserveFormValues {
  return {
    facility_id: '',
    room_type_id: '',
    room_id: '',
    stay_type_id: '',
    period_from: '',
    period_to: '',
    payment_due_date: '',
    noreserve_count_before: '0',
    noreserve_count_after: '0',
    auto_extend_flag: false,
    confirm_flag: '1',
    directcheckin_type: '1',
    advertising_type: '0',
    rental_keys: '0',
    note: '',
    overdue_debt_note: '',
    disable_reservation: false,
    directcheckin_flag: false,
    keybox_name: '',
    keybox_password: '',
    di_contact_staff_id: '',
    contacted_flag: false,
    checkin_date: '',
    box_usage_period_type: '',
    box_usage_start_date: '',
    box_usage_end_date: '',
  }
}

const reservationRequestNormalRowSchema = z.object({
  request_detail_id: z.number().optional(),
  is_checked: z.boolean().default(false),
  request_type_id: z.string().optional(),
  request_from: z.string().optional(),
  request_to: z.string().optional(),
  count: z.string().optional(),
  count_unit: z.string().optional(),
  unit_price: z.string().optional(),
  charge_staff_id: z.string().optional(),
  source_type: z.string().optional(),
  source_id: z.string().optional(),
  source_key: z.string().optional(),
})

export const reservationOccupierRowSchema = z.object({
  reserve_occupier_id: z.number().optional(),
  occupier_name: z.string().default(''),
  sex: z.string().default(''),
  birthday: z.string().optional().nullable(),
  tel: z.string().optional(),
  address1: z.string().optional(),
  order_num: z.number().default(0),
})

const parkingReserveRowSchema = z.object({
  parking_reserve_id: z.number().optional(),
  parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().optional().nullable(),
  period_to: z.string().optional().nullable(),
  stay_type_id: z.number().optional(),
  confirm_flag: z.boolean().optional(),
  note: z.string().optional(),
  license_plate: z.string().default(''),
  car_type: z.string().default(''),
})

const bicycleParkingReserveRowSchema = z.object({
  bicycle_parking_reserve_id: z.number().optional(),
  bicycle_parking_id: z.number().optional(),
  facility_name: z.string().optional(),
  facility_no: z.string().optional(),
  period_from: z.string().optional().nullable(),
  period_to: z.string().optional().nullable(),
  confirm_flag: z.boolean().optional(),
  bicycle_type_note: z.string().optional(),
  note: z.string().optional(),
})

export const reservationCreateReserveSchema = reservationCommonReserveSchema.extend({
  auto_extend_flag: z.boolean().default(false),
  checkin_time: z.string().optional(),
  request_normal: z.array(reservationRequestNormalRowSchema).default([]),
  occupiers: z.array(reservationOccupierRowSchema).default([]),
  parking_reserve: z.array(parkingReserveRowSchema).default([]),
  bicycle_parking_reserve: z.array(bicycleParkingReserveRowSchema).default([]),
})

export type ReservationCreateReserveFormValues = z.infer<typeof reservationCreateReserveSchema>

export function getReservationCreateReserveDefaultValues(): ReservationCreateReserveFormValues {
  return {
    ...getReservationCommonReserveDefaultValues(),
    auto_extend_flag: false,
    checkin_time: '14:00',
    request_normal: [],
    occupiers: [],
    parking_reserve: [],
    bicycle_parking_reserve: [],
  }
}

export const reservationEditReserveSchema = reservationCommonReserveSchema.extend({
  area_id: z.string().optional(),
  period_from_time: z.string().optional(),
  return_keys: z.string().default('0'),
  key_return_flag: z.boolean().default(false),
  key_return_contact_type: z.string().optional(),
  key_return_datetime: z.string().optional(),
  extension_time: z.string().optional(),
  checked_delete: z.boolean().default(false),
  delete_status: z.string().optional(),
  amendment: z.string().optional(),
  pet_flag: z.boolean().default(false),
  dog_count: z.string().default('0'),
  cat_count: z.string().default('0'),
  other_count: z.string().default('0'),
  pet_note: z.string().optional(),
  futon_flag: z.boolean().default(false),
  deliverybox_flag: z.boolean().default(false),
  charge_staff_id: z.string().optional(),
  charge_staff_id2: z.string().optional(),
  request_announcement: z.string().max(1024).optional(),
  sale_announcement: z.string().max(1024).optional(),
  request_normal: z.array(reservationRequestNormalRowSchema).default([]),
  occupiers: z.array(reservationOccupierRowSchema).default([]),
  parking_reserve: z.array(parkingReserveRowSchema).default([]),
  bicycle_parking_reserve: z.array(bicycleParkingReserveRowSchema).default([]),
})

export type ReservationEditReserveFormValues = z.infer<typeof reservationEditReserveSchema>

export function getReservationEditReserveDefaultValues(): ReservationEditReserveFormValues {
  return {
    ...getReservationCommonReserveDefaultValues(),
    area_id: '',
    period_from_time: '14:00',
    return_keys: '0',
    key_return_flag: false,
    key_return_contact_type: '',
    key_return_datetime: '',
    extension_time: '',
    checked_delete: false,
    delete_status: '',
    amendment: '',
    pet_flag: false,
    dog_count: '0',
    cat_count: '0',
    other_count: '0',
    pet_note: '',
    futon_flag: false,
    deliverybox_flag: false,
    charge_staff_id: '',
    charge_staff_id2: '',
    request_announcement: '',
    sale_announcement: '',
    request_normal: [],
    occupiers: [],
    parking_reserve: [],
    bicycle_parking_reserve: [],
  }
}
