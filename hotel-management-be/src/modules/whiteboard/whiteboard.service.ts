import { Injectable } from '@nestjs/common';
import { WhiteboardRepository, FacilityWithRooms } from './whiteboard.repository';
import {
  WhiteboardFilterDto,
  WhiteboardFacilityDto,
  WhiteboardReserveItemDto,
  WhiteboardResponseDto,
  WhiteboardRoomDto,
  WhiteboardStayTypeRentDto,
} from './dto';

@Injectable()
export class WhiteboardService {
  constructor(private readonly repository: WhiteboardRepository) {}

  async findAll(filter: WhiteboardFilterDto): Promise<WhiteboardResponseDto> {
    const { facilities, total } =
      await this.repository.findFacilitiesPaginated(filter);

    return {
      pagination: {
        currentPage: filter.page,
        perPage: filter.perPage,
        total,
        lastPage: Math.max(1, Math.ceil(total / filter.perPage)),
      },
      usageStatuses: facilities.map((f) => this.mapFacility(f)),
    };
  }

  private mapFacility(f: FacilityWithRooms): WhiteboardFacilityDto {
    const parkingCount = f.parkings.length;
    const parkingHasReserveCount = f.parkings.filter(
      (p) => p.parkingReserves.length > 0,
    ).length;
    const acreageByRoomTypeId = new Map<number, string | null>(
      f.facilityRoomTypes.map((item) => [item.roomTypeId, item.acreage]),
    );

    return {
      facilityId: f.facilityId,
      facilityNo: f.facilityNo,
      facilityName: f.facilityName,
      colorOption: f.colorOption,
      parkingFlag: f.parkingFlag,
      bicycleParkingFlag: f.bicycleParkingFlag,
      deliveryboxFlag: f.deliveryboxFlag,
      parkingCount,
      parkingHasReserveCount,
      rooms: f.rooms.map((r) =>
        this.mapRoom(
          r,
          f.facilityId,
          acreageByRoomTypeId.get(r.roomTypeId) ?? null,
        ),
      ),
    };
  }

  private mapRoom(
    r: FacilityWithRooms['rooms'][number],
    facilityId: number,
    acreage: string | null,
  ): WhiteboardRoomDto {
    return {
      roomId: r.roomId,
      facilityId,
      roomNumber: r.roomNumber,
      roomTypeId: r.roomTypeId,
      roomTypeName: r.roomType?.roomTypeName ?? null,
      roomTypeNameShort: r.roomType?.roomTypeNameShort ?? null,
      roomClassId: r.roomType?.roomClassId ?? null,
      roomClassName: r.roomType?.roomClass?.roomClassName ?? null,
      roomStatus: r.roomStatus,
      petFlag: r.petFlag,
      deliveryboxFlag: r.deliveryboxFlag,
      acreage,
      stayTypeRents: this.mapStayTypeRents(r),
      usageStatus: r.reserves.map((res) => this.mapReserve(res)),
      constructions: [],
      memos: [],
    };
  }

  private mapStayTypeRents(
    room: FacilityWithRooms['rooms'][number],
  ): WhiteboardStayTypeRentDto[] {
    return (room.roomType?.rents ?? []).map((rent) => ({
      stayTypeId: rent.stayTypeId,
      stayTypeNameShort: rent.stayType?.stayTypeNameShort ?? null,
      price: this.resolveRentPrice(rent.dayRent, rent.monthRent),
    }));
  }

  private resolveRentPrice(
    dayRent: number | null,
    monthRent: bigint | null,
  ): number | null {
    if (dayRent !== null) return dayRent;
    if (monthRent === null) return null;

    const parsedMonthRent = Number(monthRent);
    if (!Number.isFinite(parsedMonthRent)) return null;

    return Math.round(parsedMonthRent / 30);
  }

  private mapReserve(
    res: FacilityWithRooms['rooms'][number]['reserves'][number],
  ): WhiteboardReserveItemDto {
    return {
      reserveId: res.reserveId,
      clientId: res.clientId,
      clientName: res.client?.clientName ?? null,
      occupierName: res.reserveOccupiers[0]?.occupierName ?? null,
      periodFrom: this.formatDateTime(res.periodFrom),
      periodTo: this.formatDateTime(res.periodTo),
      reserveStatus: res.reserveStatus,
      confirmFlag: res.confirmFlag,
      checkinFlag: res.checkinFlag,
      draftFlag: res.draftFlag,
      rakutenFlag: res.rakutenFlag,
      directcheckinFlag: res.directcheckinFlag,
      campaignPriceFlag: res.campaignPriceFlag,
      disableReservation: res.disableReservation,
      petFlag: res.petFlag,
      futonFlag: res.futonFlag,
      deliveryboxFlag: res.deliveryboxFlag,
      clientDataType: res.client?.dataType ?? null,
      clientAdvertisingType: res.client?.advertisingType ?? null,
      advertisingType: res.advertisingType,
      earlyExitDatetime: this.formatDateTime(res.earlyExitDatetime),
      noreserveCountBefore: res.noreserveCountBefore,
      noreserveCountAfter: res.noreserveCountAfter,
      extensionTime: res.extensionTime,
      parkingReserveCount: res.parkingReserves.length,
      bicycleParkingReserveCount: res.bicycleParkingReserves.length,
      memo: res.memo,
    };
  }

  private formatDateTime(d: Date | null): string | null {
    if (!d) return null;
    return d.toISOString();
  }
}
