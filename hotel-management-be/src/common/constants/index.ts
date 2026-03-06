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
} as const;
