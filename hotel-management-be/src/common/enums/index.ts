export enum DataStatus {
  UNAVAILABLE = 0,
  AVAILABLE = 1,
  HIDDEN = 2,
}

export enum StaffType {
  ADMIN = 1,
  MANAGER = 2,
  STAFF = 3,
  PART_TIME = 4,
}

export enum ClientType {
  NOT_SPECIFIED = 0,
  INDIVIDUAL = 1,
  CORPORATION = 2,
  SPECIAL_CORPORATION = 3,
}

export enum ReserveStatus {
  PENDING = 1,
  CONFIRMED = 2,
  CHECKED_IN = 3,
  CHECKED_OUT = 4,
  CANCELLED = 5,
}

export enum DeleteStatus {
  DELETED = 1,
  CANCELLED = 2,
  NO_SHOW = 3,
}

export enum ReserveType {
  NORMAL = 1,
  DRAFT = 2,
}

export enum PeriodType {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
}

export enum CleanStatus {
  NOT_CLEANED = 0,
  CLEANED = 1,
  IN_PROGRESS = 2,
}

export enum SexType {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3,
}

export enum RoomStatus {
  FULL_CLEANING = 1,
  PARTIAL_CLEANING = 2,
  FINISHING = 3,
}

export enum FacilityType {
  HOTEL = 1,
  TRUNK_ROOM = 2,
}

export enum StayContractType {
  WEEKLY = 1,
  MONTHLY = 2,
}

export enum AdvertisingType {
  REPEAT = 1,
  WALK_IN = 2,
  HOMEPAGE = 3,
  RAKUTEN = 4,
  ENGLISH_SITE = 5,
  OTHER = 9,
}

export enum DirectCheckinType {
  VISIT = 1,
  SIX_BUILDING = 2,
  DIRECT_IN = 3,
  YCAT = 4,
  ROOM_DELIVERY = 5,
}

export enum KeyReturnContactType {
  BRING = 1,
  TEL = 2,
  EARLY_EXIT = 3,
}

export enum UsageStatusReserveStatus {
  CONFIRMED = 1,
  MONTHLY = 2,
  TENTATIVE = 3,
  ENGLISH_SITE = 4,
}
