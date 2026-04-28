export interface ParkingReserveItemDto {
  parkingReserveId: number;
  parkingId: number;
  reserveId: number | null;
  clientId: number | null;
  clientName: string | null;
  clientDataType: number | null;
  dataStatus: number;
  periodFrom: string;
  periodTo: string | null;
  confirmFlag: boolean;
  checkinFlag: boolean;
  checkoutFlag: boolean;
  carType: string | null;
  licensePlate: string | null;
  note: string | null;
  saleDate: string | null;
  chargeStaffId: number | null;
  facilityNo: string | null;
  roomNumber: string | null;
  reservePeriodFrom: string | null;
  reservePeriodTo: string | null;
}

export interface ParkingSlotDto {
  parkingId: number;
  number: string;
  heightLimit: number;
  notice: string | null;
  dataStatus: number;
  facilityId: number;
  facilityName: string;
  parkingReserves: ParkingReserveItemDto[];
}

export interface BicycleParkingReserveItemDto {
  bicycleParkingReserveId: number;
  bicycleParkingId: number;
  reserveId: number | null;
  clientId: number | null;
  clientName: string | null;
  clientDataType: number | null;
  dataStatus: number;
  periodFrom: string;
  periodTo: string | null;
  confirmFlag: boolean;
  checkinFlag: boolean;
  checkoutFlag: boolean;
  bicycleTypeNote: string | null;
  note: string | null;
  saleDate: string | null;
  chargeStaffId: number | null;
  facilityNo: string | null;
  roomNumber: string | null;
  reservePeriodFrom: string | null;
  reservePeriodTo: string | null;
}

export interface BicycleParkingSlotDto {
  bicycleParkingId: number;
  number: string;
  notice: string | null;
  dataStatus: number;
  facilityId: number;
  facilityName: string;
  bicycleParkingReserves: BicycleParkingReserveItemDto[];
}

export interface FacilityParkingStatusDto {
  facilityId: number;
  facilityName: string;
  colorOption: string | null;
  parkings: ParkingSlotDto[];
  bicycleParkings: BicycleParkingSlotDto[];
  prices: Record<number, number>;
}
