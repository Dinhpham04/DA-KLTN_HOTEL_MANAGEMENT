export enum CleaningStatus {
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  PAUSED = 3,
  FINISHED = 4,
  CHECKED = 5,
  REOPENED = 6,
  CANCELLED = 7,
}

export const ALLOWED_TRANSITIONS: Record<CleaningStatus, CleaningStatus[]> = {
  [CleaningStatus.NOT_STARTED]: [CleaningStatus.IN_PROGRESS, CleaningStatus.CANCELLED],
  [CleaningStatus.IN_PROGRESS]: [
    CleaningStatus.PAUSED,
    CleaningStatus.FINISHED,
    CleaningStatus.CANCELLED,
  ],
  [CleaningStatus.PAUSED]: [CleaningStatus.IN_PROGRESS, CleaningStatus.CANCELLED],
  [CleaningStatus.FINISHED]: [CleaningStatus.CHECKED, CleaningStatus.REOPENED],
  [CleaningStatus.CHECKED]: [CleaningStatus.REOPENED],
  [CleaningStatus.REOPENED]: [CleaningStatus.IN_PROGRESS],
  [CleaningStatus.CANCELLED]: [],
};

export function isAllowedTransition(from: CleaningStatus, to: CleaningStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
