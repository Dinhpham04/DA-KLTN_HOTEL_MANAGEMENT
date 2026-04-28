export enum CleaningDataType {
  ROOM = 1,
  COMMON_AREA = 2,
  KEY_SAFETY = 3,
}

export const CLEANING_DATA_TYPE_LABEL: Record<CleaningDataType, string> = {
  [CleaningDataType.ROOM]: 'Dọn phòng',
  [CleaningDataType.COMMON_AREA]: 'Dọn khu vực chung',
  [CleaningDataType.KEY_SAFETY]: 'Khóa & An toàn',
};
