import { Injectable } from '@nestjs/common';
import { ParkingStatusRepository } from './parking-status.repository';
import {
  ParkingStatusFilterDto,
  FacilityParkingStatusDto,
  ParkingSlotDto,
  ParkingReserveItemDto,
  BicycleParkingSlotDto,
  BicycleParkingReserveItemDto,
} from './dto';

@Injectable()
export class ParkingStatusService {
  constructor(private readonly repository: ParkingStatusRepository) {}

  async getParkingStatus(
    filter: ParkingStatusFilterDto,
  ): Promise<FacilityParkingStatusDto[]> {
    const facilities = await this.repository.findFacilitiesWithParkingStatus(filter);

    const data: FacilityParkingStatusDto[] = facilities.map((facility) => {
      // Build prices map from first parking's rents (same price structure per facility)
      const prices: Record<number, number> = {};
      const firstParking = (facility as any).parkings?.[0];
      if (firstParking?.parkingRents) {
        for (const rent of firstParking.parkingRents) {
          prices[rent.stayTypeId] = rent.rent;
        }
      }

      // Map car parkings
      const parkings: ParkingSlotDto[] = ((facility as any).parkings ?? []).map(
        (parking: any): ParkingSlotDto => ({
          parkingId: parking.parkingId,
          number: parking.number,
          heightLimit: parking.heightLimit,
          notice: parking.notice,
          dataStatus: parking.dataStatus,
          facilityId: facility.facilityId,
          facilityName: facility.facilityName,
          parkingReserves: (parking.parkingReserves ?? []).map(
            (pr: any): ParkingReserveItemDto => ({
              parkingReserveId: pr.parkingReserveId,
              parkingId: pr.parkingId,
              reserveId: pr.reserveId,
              clientId: pr.clientId,
              clientName: pr.client?.clientName ?? null,
              clientDataType: pr.client?.dataType ?? null,
              dataStatus: pr.dataStatus,
              periodFrom: this.formatDate(pr.periodFrom),
              periodTo: pr.periodTo ? this.formatDate(pr.periodTo) : null,
              confirmFlag: pr.confirmFlag,
              checkinFlag: pr.checkinFlag,
              checkoutFlag: pr.checkoutFlag,
              carType: pr.carType,
              licensePlate: pr.licensePlate,
              note: pr.note,
              saleDate: pr.saleDate ? this.formatDate(pr.saleDate) : null,
              chargeStaffId: pr.reserve?.chargeStaffId ?? null,
              facilityNo: pr.reserve?.facility?.facilityNo ?? null,
              roomNumber: pr.reserve?.room?.roomNumber ?? null,
              reservePeriodFrom: pr.reserve?.periodFrom
                ? this.formatDate(pr.reserve.periodFrom)
                : null,
              reservePeriodTo: pr.reserve?.periodTo
                ? this.formatDate(pr.reserve.periodTo)
                : null,
            }),
          ),
        }),
      );

      // Map bicycle parkings
      const bicycleParkings: BicycleParkingSlotDto[] = (
        (facility as any).bicycleParkings ?? []
      ).map(
        (bp: any): BicycleParkingSlotDto => ({
          bicycleParkingId: bp.bicycleParkingId,
          number: bp.number,
          notice: bp.notice,
          dataStatus: bp.dataStatus,
          facilityId: facility.facilityId,
          facilityName: facility.facilityName,
          bicycleParkingReserves: (bp.bicycleParkingReserves ?? []).map(
            (bpr: any): BicycleParkingReserveItemDto => ({
              bicycleParkingReserveId: bpr.bicycleParkingReserveId,
              bicycleParkingId: bpr.bicycleParkingId,
              reserveId: bpr.reserveId,
              clientId: bpr.clientId,
              clientName: bpr.client?.clientName ?? null,
              clientDataType: bpr.client?.dataType ?? null,
              dataStatus: bpr.dataStatus,
              periodFrom: this.formatDate(bpr.periodFrom),
              periodTo: bpr.periodTo ? this.formatDate(bpr.periodTo) : null,
              confirmFlag: bpr.confirmFlag,
              checkinFlag: bpr.checkinFlag,
              checkoutFlag: bpr.checkoutFlag,
              bicycleTypeNote: bpr.bicycleTypeNote,
              note: bpr.note,
              saleDate: bpr.saleDate ? this.formatDate(bpr.saleDate) : null,
              chargeStaffId: bpr.reserve?.chargeStaffId ?? null,
              facilityNo: bpr.reserve?.facility?.facilityNo ?? null,
              roomNumber: bpr.reserve?.room?.roomNumber ?? null,
              reservePeriodFrom: bpr.reserve?.periodFrom
                ? this.formatDate(bpr.reserve.periodFrom)
                : null,
              reservePeriodTo: bpr.reserve?.periodTo
                ? this.formatDate(bpr.reserve.periodTo)
                : null,
            }),
          ),
        }),
      );

      return {
        facilityId: facility.facilityId,
        facilityName: facility.facilityName,
        colorOption: facility.colorOption,
        parkings,
        bicycleParkings,
        prices,
      };
    });

    return data;
  }

  private formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }
}
