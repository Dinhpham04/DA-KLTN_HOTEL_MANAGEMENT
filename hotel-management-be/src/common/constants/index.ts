export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  BCRYPT_ROUNDS: 12,
  DATE_FORMAT: 'YYYY/MM/DD',
  DATETIME_FORMAT: 'YYYY/MM/DD HH:mm:ss',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied: insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  ROOM_OVERLAP: '日程が他の予約と重複しています。再度ご確認ください。',
  INVALID_STATUS_TRANSITION: 'Invalid reservation status transition',
  RESERVATION_NOT_CONFIRMED: 'Reservation must be confirmed before check-in',
  RESERVATION_NOT_CHECKED_IN: 'Reservation must be checked in before check-out',
  RESERVATION_ALREADY_CANCELLED: 'Reservation is already cancelled',
  RESERVATION_ALREADY_CHECKED_OUT: 'Reservation is already checked out',
  ROOM_REQUIRED_FOR_CHECKIN: 'Room assignment is required for check-in',
  PERIOD_REQUIRED: 'Period from and period to are required',
} as const;

export const RESERVATION_EVENTS = {
  CREATED: 'reservation.created',
  CONFIRMED: 'reservation.confirmed',
  CHECKED_IN: 'reservation.checked_in',
  CHECKED_OUT: 'reservation.checked_out',
  CANCELLED: 'reservation.cancelled',
} as const;
