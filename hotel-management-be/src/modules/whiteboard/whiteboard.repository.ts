import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { WhiteboardFilterDto } from './dto';

const SERVICE_PARKING = 1;
const SERVICE_BICYCLE = 2;
const SERVICE_PET = 4;
const SERVICE_BOX = 5;
const CLEAN_TYPE_IN_USE = 4;
const DATA_STATUS_AVAILABLE = 1;
const DEPOSIT_FLAG_NONE = 0;

@Injectable()
export class WhiteboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFacilitiesPaginated(
    filter: WhiteboardFilterDto,
  ): Promise<{ facilities: FacilityWithRooms[]; total: number }> {
    const where = this.buildFacilityWhere(filter);
    const skip = (filter.page - 1) * filter.perPage;

    const [total, facilities] = await this.prisma.$transaction([
      this.prisma.facility.count({ where }),
      this.prisma.facility.findMany({
        where,
        orderBy: [{ facilityNo: 'asc' }, { facilityId: 'asc' }],
        skip,
        take: filter.perPage,
        include: {
          rooms: {
            where: this.buildRoomWhere(filter),
            orderBy: [{ roomNumber: 'asc' }, { roomId: 'asc' }],
            include: {
              roomType: {
                select: {
                  roomTypeId: true,
                  roomTypeName: true,
                  roomTypeNameShort: true,
                  roomClassId: true,
                  roomClass: {
                    select: { roomClassId: true, roomClassName: true },
                  },
                  rents: {
                    where: {
                      deletedAt: null,
                      dataStatus: DATA_STATUS_AVAILABLE,
                      depositFlag: DEPOSIT_FLAG_NONE,
                    },
                    orderBy: [
                      { stayType: { orderNum: 'asc' } },
                      { stayTypeId: 'asc' },
                    ],
                    select: {
                      stayTypeId: true,
                      dayRent: true,
                      monthRent: true,
                      stayType: {
                        select: {
                          stayTypeId: true,
                          stayTypeNameShort: true,
                          orderNum: true,
                        },
                      },
                    },
                  },
                },
              },
              reserves: {
                where: this.buildReserveWhere(filter),
                orderBy: [{ periodFrom: 'asc' }, { reserveId: 'asc' }],
                include: {
                  client: {
                    select: {
                      clientId: true,
                      clientName: true,
                      dataType: true,
                      advertisingType: true,
                    },
                  },
                  reserveOccupiers: {
                    where: { deletedAt: null, orderNum: 1 },
                    select: { occupierName: true },
                    take: 1,
                  },
                  parkingReserves: {
                    where: { deletedAt: null },
                    select: { parkingReserveId: true },
                  },
                  bicycleParkingReserves: {
                    where: { deletedAt: null },
                    select: { bicycleParkingReserveId: true },
                  },
                },
              },
            },
          },
          parkings: {
            where: { deletedAt: null },
            select: {
              parkingId: true,
              parkingReserves: {
                where: this.buildParkingReserveWhere(filter),
                select: { parkingReserveId: true },
                take: 1,
              },
            },
          },
          facilityRoomTypes: {
            where: {
              deletedAt: null,
              dataStatus: DATA_STATUS_AVAILABLE,
            },
            select: {
              roomTypeId: true,
              acreage: true,
            },
          },
        },
      }),
    ]);

    return { facilities: facilities as unknown as FacilityWithRooms[], total };
  }

  private buildFacilityWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.FacilityWhereInput {
    const where: Prisma.FacilityWhereInput = { deletedAt: null };

    if (filter.facilityIds?.length) {
      where.facilityId = { in: filter.facilityIds };
    }
    if (filter.facilityNo) {
      where.facilityNo = filter.facilityNo;
    }

    // If service filter requires parking/bicycle, restrict to facilities that have them
    const services = filter.serviceTypes ?? [];
    if (services.includes(SERVICE_PARKING)) {
      where.parkingFlag = true;
    }
    if (services.includes(SERVICE_BICYCLE)) {
      where.bicycleParkingFlag = true;
    }
    if (services.includes(SERVICE_BOX)) {
      where.deliveryboxFlag = true;
    }

    return where;
  }

  private buildRoomWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.RoomWhereInput {
    const where: Prisma.RoomWhereInput = { deletedAt: null };

    if (filter.roomNumber) {
      where.roomNumber = { contains: filter.roomNumber };
    }
    if (filter.roomClassIds?.length) {
      where.roomType = {
        roomClassId: { in: filter.roomClassIds },
      };
    }

    const services = filter.serviceTypes ?? [];
    if (services.includes(SERVICE_PET)) {
      where.petFlag = true;
    }
    if (services.includes(SERVICE_BOX)) {
      where.deliveryboxFlag = true;
    }

    // Service parking/bicycle: rooms must have a reserve with overlapping
    // parking/bicycle reservation in the period
    const reserveSomeFilters: Prisma.ReserveWhereInput[] = [];
    if (services.includes(SERVICE_PARKING)) {
      reserveSomeFilters.push({
        deletedAt: null,
        parkingReserves: { some: this.buildParkingReserveWhere(filter) },
      });
    }
    if (services.includes(SERVICE_BICYCLE)) {
      reserveSomeFilters.push({
        deletedAt: null,
        bicycleParkingReserves: { some: this.buildBicycleReserveWhere(filter) },
      });
    }
    if (reserveSomeFilters.length) {
      where.AND = reserveSomeFilters.map((rWhere) => ({
        reserves: { some: rWhere },
      }));
    }

    // Clean status filter: 4 = in use → restrict rooms with checked-in reserves
    const cleanTypes = filter.cleanTypes ?? [];
    if (cleanTypes.includes(CLEAN_TYPE_IN_USE)) {
      const inUseFilter: Prisma.ReserveWhereInput = {
        deletedAt: null,
        checkinFlag: true,
        ...this.buildPeriodOverlapWhere(filter),
      };
      where.AND = [
        ...((where.AND as Prisma.RoomWhereInput[] | undefined) ?? []),
        { reserves: { some: inUseFilter } },
      ];
    }

    return where;
  }

  private buildReserveWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.ReserveWhereInput {
    return {
      deletedAt: null,
      ...this.buildPeriodOverlapWhere(filter),
    };
  }

  private buildParkingReserveWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.ParkingReserveWhereInput {
    const where: Prisma.ParkingReserveWhereInput = { deletedAt: null };
    if (filter.periodTo) {
      where.periodFrom = { lte: new Date(filter.periodTo) };
    }
    if (filter.periodFrom) {
      where.OR = [
        { periodTo: null },
        { periodTo: { gte: new Date(filter.periodFrom) } },
      ];
    }
    return where;
  }

  private buildBicycleReserveWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.BicycleParkingReserveWhereInput {
    const where: Prisma.BicycleParkingReserveWhereInput = { deletedAt: null };
    if (filter.periodTo) {
      where.periodFrom = { lte: new Date(filter.periodTo) };
    }
    if (filter.periodFrom) {
      where.OR = [
        { periodTo: null },
        { periodTo: { gte: new Date(filter.periodFrom) } },
      ];
    }
    return where;
  }

  /**
   * Period overlap: a record [from, to] overlaps a window [filterFrom, filterTo]
   * iff (from <= filterTo) AND (to >= filterFrom OR to IS NULL).
   * If no period is specified, return no extra constraint.
   */
  private buildPeriodOverlapWhere(
    filter: WhiteboardFilterDto,
  ): Prisma.ReserveWhereInput {
    if (!filter.periodFrom && !filter.periodTo) return {};

    const constraints: Prisma.ReserveWhereInput[] = [];
    if (filter.periodTo) {
      constraints.push({ periodFrom: { lte: new Date(filter.periodTo) } });
    }
    if (filter.periodFrom) {
      constraints.push({
        OR: [
          { periodTo: null },
          { periodTo: { gte: new Date(filter.periodFrom) } },
        ],
      });
    }
    return { AND: constraints };
  }
}

// Loose type for include result (Prisma's deep generics get unwieldy here)
export type FacilityWithRooms = {
  facilityId: number;
  facilityNo: string;
  facilityName: string;
  colorOption: string | null;
  parkingFlag: boolean;
  bicycleParkingFlag: boolean;
  deliveryboxFlag: boolean;
  rooms: Array<{
    roomId: number;
    facilityId: number;
    roomNumber: string;
    roomTypeId: number;
    roomStatus: number;
    petFlag: boolean;
    deliveryboxFlag: boolean;
    roomType: {
      roomTypeId: number;
      roomTypeName: string;
        roomTypeNameShort: string;
      roomClassId: number;
      roomClass: { roomClassId: number; roomClassName: string } | null;
        rents: Array<{
          stayTypeId: number;
          dayRent: number | null;
          monthRent: bigint | null;
          stayType: {
            stayTypeId: number;
            stayTypeNameShort: string;
            orderNum: number;
          } | null;
        }>;
    } | null;
    reserves: Array<{
      reserveId: number;
      clientId: number | null;
      periodFrom: Date | null;
      periodTo: Date | null;
      earlyExitDatetime: Date | null;
      reserveStatus: number;
      checkinFlag: boolean;
      draftFlag: boolean;
      rakutenFlag: boolean;
      confirmFlag: boolean;
      directcheckinFlag: boolean;
      campaignPriceFlag: boolean;
      disableReservation: boolean;
      petFlag: boolean;
      futonFlag: boolean;
      deliveryboxFlag: boolean;
      advertisingType: number | null;
      noreserveCountBefore: number | null;
      noreserveCountAfter: number | null;
      extensionTime: number | null;
      memo: string | null;
      client: {
        clientId: number;
        clientName: string;
        dataType: number;
        advertisingType: number | null;
      } | null;
      reserveOccupiers: Array<{ occupierName: string }>;
      parkingReserves: Array<{ parkingReserveId: number }>;
      bicycleParkingReserves: Array<{ bicycleParkingReserveId: number }>;
    }>;
  }>;
  parkings: Array<{
    parkingId: number;
    parkingReserves: Array<{ parkingReserveId: number }>;
  }>;
  facilityRoomTypes: Array<{
    roomTypeId: number;
    acreage: string | null;
  }>;
};
