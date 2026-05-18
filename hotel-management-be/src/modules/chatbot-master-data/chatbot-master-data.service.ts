import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { ChatbotMasterDataQueryDto } from './dto';

@Injectable()
export class ChatbotMasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getMasterData(query: ChatbotMasterDataQueryDto) {
    const [facilities, roomClasses, roomTypes, requestTypes, rents] = await Promise.all([
      this.getFacilities({ ...query, includeRooms: query.includeRooms ?? false }),
      this.getRoomClasses(query),
      this.getRoomTypes({ ...query, includePricing: query.includePricing ?? false }),
      this.getRequestTypes(query),
      this.getRents(query),
    ]);

    return {
      summary: {
        facilityCount: facilities.facilities.length,
        roomClassCount: roomClasses.roomClasses.length,
        roomTypeCount: roomTypes.roomTypes.length,
        requestTypeCount: requestTypes.requestTypes.length,
        rentCount: rents.rents.length,
      },
      facilities: facilities.facilities,
      roomClasses: roomClasses.roomClasses,
      roomTypes: roomTypes.roomTypes,
      requestTypes: requestTypes.requestTypes,
      rents: query.includePricing ? rents.rents : [],
      included: {
        rooms: query.includeRooms ?? false,
        pricing: query.includePricing ?? false,
        prices: query.includePrices ?? false,
      },
      sources: [{ type: 'api', name: 'GET /internal/chatbot/master-data' }],
    };
  }

  async getFacilities(query: ChatbotMasterDataQueryDto) {
    const where: Prisma.FacilityWhereInput = {
      deletedAt: null,
      dataStatus: query.dataStatus ?? 1,
      ...(query.facilityId !== undefined ? { facilityId: query.facilityId } : {}),
      ...(query.search
        ? {
            OR: [
              { facilityNo: { contains: query.search, mode: 'insensitive' } },
              { facilityName: { contains: query.search, mode: 'insensitive' } },
              { facilityNameEn: { contains: query.search, mode: 'insensitive' } },
              { address: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const facilities = await this.prisma.facility.findMany({
      where,
      include: {
        rooms: {
          where: { deletedAt: null, dataStatus: 1 },
          include: { roomType: { include: { roomClass: true } } },
          orderBy: [{ orderNum: 'asc' }, { roomNumber: 'asc' }],
        },
        facilityRoomTypes: {
          where: { deletedAt: null },
          include: { roomType: { include: { roomClass: true } } },
          orderBy: [{ roomTypeId: 'asc' }],
        },
        parkings: {
          where: { deletedAt: null, dataStatus: 1 },
          orderBy: [{ orderNum: 'asc' }, { number: 'asc' }],
        },
        bicycleParkings: {
          where: { deletedAt: null, dataStatus: 1 },
          orderBy: [{ orderNum: 'asc' }, { number: 'asc' }],
        },
        servicePrices: query.includePricing
          ? {
              where: { deletedAt: null, dataStatus: 1 },
              include: { requestType: true },
              orderBy: [{ requestTypeId: 'asc' }, { effectiveFrom: 'desc' }],
            }
          : false,
      },
      orderBy: [{ orderNum: 'asc' }, { facilityId: 'asc' }],
      take: query.limit ?? 50,
    });

    return {
      facilities: facilities.map((facility) =>
        this.mapFacility(facility, {
          includeRooms: query.includeRooms ?? false,
          includePricing: query.includePricing ?? false,
          detail: false,
        }),
      ),
      sources: [{ type: 'api', name: 'GET /internal/chatbot/facilities' }],
    };
  }

  async getFacilityDetail(id: number, query: ChatbotMasterDataQueryDto) {
    const facilities = await this.prisma.facility.findMany({
      where: {
        deletedAt: null,
        dataStatus: query.dataStatus ?? 1,
        facilityId: id,
      },
      include: {
        rooms: {
          where: { deletedAt: null, dataStatus: 1 },
          include: { roomType: { include: { roomClass: true } } },
          orderBy: [{ orderNum: 'asc' }, { roomNumber: 'asc' }],
        },
        facilityRoomTypes: {
          where: { deletedAt: null },
          include: { roomType: { include: { roomClass: true } } },
          orderBy: [{ roomTypeId: 'asc' }],
        },
        parkings: {
          where: { deletedAt: null, dataStatus: 1 },
          orderBy: [{ orderNum: 'asc' }, { number: 'asc' }],
        },
        bicycleParkings: {
          where: { deletedAt: null, dataStatus: 1 },
          orderBy: [{ orderNum: 'asc' }, { number: 'asc' }],
        },
        servicePrices: query.includePricing
          ? {
              where: { deletedAt: null, dataStatus: 1 },
              include: { requestType: true },
              orderBy: [{ requestTypeId: 'asc' }, { effectiveFrom: 'desc' }],
            }
          : false,
      },
      take: 1,
    });
    const facilityEntity = facilities[0];
    const facility = facilityEntity
      ? this.mapFacility(facilityEntity, {
          includeRooms: query.includeRooms ?? false,
          includePricing: query.includePricing ?? false,
          detail: true,
        })
      : undefined;
    if (!facility) throw new NotFoundException(`Facility ${id} not found`);
    return {
      facility,
      sources: [{ type: 'api', name: 'GET /internal/chatbot/facilities/:id' }],
    };
  }

  async getRoomTypes(query: ChatbotMasterDataQueryDto) {
    const where: Prisma.RoomTypeWhereInput = {
      deletedAt: null,
      dataStatus: query.dataStatus ?? 1,
      ...(query.roomTypeId !== undefined ? { roomTypeId: query.roomTypeId } : {}),
      ...(query.roomClassId !== undefined ? { roomClassId: query.roomClassId } : {}),
      ...(query.search
        ? {
            OR: [
              { roomTypeName: { contains: query.search, mode: 'insensitive' } },
              { roomTypeNameShort: { contains: query.search, mode: 'insensitive' } },
              { roomClass: { roomClassName: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const roomTypes = await this.prisma.roomType.findMany({
      where,
      include: {
        roomClass: true,
        rooms: {
          where: {
            deletedAt: null,
            dataStatus: 1,
            ...(query.facilityId !== undefined ? { facilityId: query.facilityId } : {}),
          },
          include: { facility: true },
          orderBy: [{ facilityId: 'asc' }, { orderNum: 'asc' }, { roomNumber: 'asc' }],
        },
        facilityRoomTypes: {
          where: {
            deletedAt: null,
            ...(query.facilityId !== undefined ? { facilityId: query.facilityId } : {}),
          },
          include: { facility: true },
        },
        rents: query.includePricing
          ? {
              where: { deletedAt: null, dataStatus: 1 },
              include: { stayType: true },
              orderBy: [{ depositFlag: 'asc' }, { stayTypeId: 'asc' }],
            }
          : false,
      },
      orderBy: [{ orderNum: 'asc' }, { roomTypeId: 'asc' }],
      take: query.limit ?? 100,
    });

    return {
      roomTypes: roomTypes.map((roomType) =>
        this.mapRoomType(roomType, {
          includeRooms: query.includeRooms ?? false,
          includePricing: query.includePricing ?? false,
          detail: false,
        }),
      ),
      sources: [{ type: 'api', name: 'GET /internal/chatbot/room-types' }],
    };
  }

  async getRoomTypeDetail(id: number, query: ChatbotMasterDataQueryDto) {
    const result = await this.getRoomTypes({
      ...query,
      roomTypeId: id,
      includeRooms: query.includeRooms ?? false,
      includePricing: query.includePricing ?? false,
      limit: 1,
    });
    const roomTypeSummary = result.roomTypes[0];
    const roomType = roomTypeSummary
      ? {
          ...roomTypeSummary,
          detail: true,
        }
      : undefined;
    if (!roomType) throw new NotFoundException(`Room type ${id} not found`);
    return {
      roomType,
      sources: [{ type: 'api', name: 'GET /internal/chatbot/room-types/:id' }],
    };
  }

  async getRoomClasses(query: ChatbotMasterDataQueryDto, detail = false) {
    const where: Prisma.RoomClassWhereInput = {
      deletedAt: null,
      dataStatus: query.dataStatus ?? 1,
      ...(query.roomClassId !== undefined ? { roomClassId: query.roomClassId } : {}),
      ...(query.search
        ? { roomClassName: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const roomClasses = await this.prisma.roomClass.findMany({
      where,
      include: {
        roomTypes: {
          where: { deletedAt: null, dataStatus: 1 },
          include: {
            rooms: {
              where: {
                deletedAt: null,
                dataStatus: 1,
                ...(query.facilityId !== undefined ? { facilityId: query.facilityId } : {}),
              },
            },
          },
          orderBy: [{ orderNum: 'asc' }, { roomTypeId: 'asc' }],
        },
      },
      orderBy: [{ orderNum: 'asc' }, { roomClassId: 'asc' }],
      take: query.limit ?? 100,
    });

    return {
      roomClasses: roomClasses.map((roomClass) => this.mapRoomClass(roomClass, detail)),
      sources: [{ type: 'api', name: 'GET /internal/chatbot/room-classes' }],
    };
  }

  async getRoomClassDetail(id: number, query: ChatbotMasterDataQueryDto) {
    const result = await this.getRoomClasses({ ...query, roomClassId: id, limit: 1 }, true);
    const roomClass = result.roomClasses[0];
    if (!roomClass) throw new NotFoundException(`Room class ${id} not found`);
    return {
      roomClass,
      sources: [{ type: 'api', name: 'GET /internal/chatbot/room-classes/:id' }],
    };
  }

  async getRequestTypes(query: ChatbotMasterDataQueryDto) {
    const requestTypes = await this.prisma.requestType.findMany({
      where: {
        deletedAt: null,
        dataStatus: query.dataStatus ?? 1,
        ...(query.category ? { category: query.category } : {}),
        ...(query.search
          ? {
              OR: [
                { requestTypeName: { contains: query.search, mode: 'insensitive' } },
                { requestTypeNameEn: { contains: query.search, mode: 'insensitive' } },
                { category: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: query.includePrices
        ? {
            servicePrices: {
              where: {
                deletedAt: null,
                dataStatus: 1,
                ...(query.facilityId !== undefined
                  ? { OR: [{ facilityId: null }, { facilityId: query.facilityId }] }
                  : {}),
              },
              include: { facility: true },
              orderBy: [{ facilityId: 'desc' }, { effectiveFrom: 'desc' }],
            },
          }
        : undefined,
      orderBy: [{ orderNum: 'asc' }, { requestTypeId: 'asc' }],
      take: query.limit ?? 100,
    });

    return {
      requestTypes: requestTypes.map((requestType) =>
        this.mapRequestType(requestType, query.includePrices ?? false),
      ),
      sources: [{ type: 'api', name: 'GET /internal/chatbot/pricing/request-types' }],
    };
  }

  async getRents(query: ChatbotMasterDataQueryDto) {
    const rents = await this.prisma.rent.findMany({
      where: {
        deletedAt: null,
        dataStatus: query.dataStatus ?? 1,
        ...(query.depositFlag !== undefined ? { depositFlag: query.depositFlag } : {}),
        ...(query.roomTypeId !== undefined ? { roomTypeId: query.roomTypeId } : {}),
        ...(query.stayTypeId !== undefined ? { stayTypeId: query.stayTypeId } : {}),
        ...(query.roomClassId !== undefined ? { roomType: { roomClassId: query.roomClassId } } : {}),
      },
      include: {
        roomType: { include: { roomClass: true } },
        stayType: true,
      },
      orderBy: [
        { depositFlag: 'asc' },
        { roomType: { orderNum: 'asc' } },
        { stayTypeId: 'asc' },
      ],
      take: query.limit ?? 200,
    });

    return {
      rents: rents.map((rent) => this.mapRent(rent)),
      sources: [{ type: 'api', name: 'GET /internal/chatbot/rents/list' }],
    };
  }

  private mapFacility(
    facility: Record<string, unknown>,
    options: { includeRooms: boolean; includePricing: boolean; detail: boolean },
  ) {
    const rooms = Array.isArray(facility['rooms']) ? facility['rooms'] : [];
    const facilityRoomTypes = Array.isArray(facility['facilityRoomTypes'])
      ? facility['facilityRoomTypes']
      : [];

    const roomTypes = new Map<number, Record<string, unknown>>();
    const roomClasses = new Map<number, Record<string, unknown>>();
    for (const room of rooms as Record<string, unknown>[]) {
      const roomType = room['roomType'] as Record<string, unknown> | undefined;
      if (typeof roomType?.['roomTypeId'] === 'number') {
        roomTypes.set(roomType['roomTypeId'], this.mapRoomTypeBrief(roomType));
      }
      const roomClass = roomType?.['roomClass'] as Record<string, unknown> | undefined;
      if (typeof roomClass?.['roomClassId'] === 'number') {
        roomClasses.set(roomClass['roomClassId'], this.mapRoomClassBrief(roomClass));
      }
    }

    const result: Record<string, unknown> = {
      facilityId: facility['facilityId'],
      facilityNo: facility['facilityNo'],
      facilityName: facility['facilityName'],
      facilityNameEn: facility['facilityNameEn'],
      summary: {
        roomCount: rooms.length,
        roomTypeCount: roomTypes.size,
        roomClassCount: roomClasses.size,
        parkingCount: Array.isArray(facility['parkings']) ? facility['parkings'].length : 0,
        bicycleParkingCount: Array.isArray(facility['bicycleParkings'])
          ? facility['bicycleParkings'].length
          : 0,
        roomTypes: Array.from(roomTypes.values()),
        roomClasses: Array.from(roomClasses.values()),
      },
    };

    if (options.detail) {
      Object.assign(result, {
        facilityType: facility['facilityType'],
        zipCode: facility['zipCode'],
        address: facility['address'],
        addressEn: facility['addressEn'],
        keyFunction: facility['keyFunction'],
        sharePlaceFlag: facility['sharePlaceFlag'],
        parkingFlag: facility['parkingFlag'],
        bicycleParkingFlag: facility['bicycleParkingFlag'],
        deliveryboxFlag: facility['deliveryboxFlag'],
        memo: facility['memo'],
      });
    }

    if (options.includeRooms) {
      result['rooms'] = rooms.map((room) => this.mapRoomSummary(room as Record<string, unknown>));
    }

    if (options.includePricing && Array.isArray(facility['servicePrices'])) {
      result['servicePrices'] = facility['servicePrices'].map((item) => this.toPlain(item));
    }

    return result;
  }

  private mapRoomType(
    roomType: Record<string, unknown>,
    options: { includeRooms: boolean; includePricing: boolean; detail: boolean },
  ) {
    const rooms = Array.isArray(roomType['rooms']) ? roomType['rooms'] : [];
    const facilities = new Map<number, Record<string, unknown>>();
    for (const room of rooms as Record<string, unknown>[]) {
      const facility = room['facility'] as Record<string, unknown> | undefined;
      if (typeof facility?.['facilityId'] === 'number') {
        facilities.set(facility['facilityId'], this.toPlain(facility) as Record<string, unknown>);
      }
    }

    const roomClass = roomType['roomClass'] as Record<string, unknown> | undefined;
    const result: Record<string, unknown> = {
      roomTypeId: roomType['roomTypeId'],
      roomTypeName: roomType['roomTypeName'],
      roomTypeNameShort: roomType['roomTypeNameShort'],
      acreage: roomType['acreage'],
      roomClass: roomClass
        ? {
            roomClassId: roomClass['roomClassId'],
            roomClassName: roomClass['roomClassName'],
          }
        : null,
      summary: {
        roomCount: rooms.length,
        facilities: Array.from(facilities.values()).map((facility) => ({
          facilityId: facility['facilityId'],
          facilityNo: facility['facilityNo'],
          facilityName: facility['facilityName'],
        })),
      },
    };

    if (options.includeRooms) {
      result['rooms'] = rooms.map((room) => this.mapRoomSummary(room as Record<string, unknown>));
    }

    if (options.includePricing && Array.isArray(roomType['rents'])) {
      result['rents'] = roomType['rents'].map((rent) => this.mapRent(rent as Record<string, unknown>));
    }

    if (options.detail) result['detail'] = true;

    return result;
  }

  private mapRoomClass(roomClass: Record<string, unknown>, detail: boolean) {
    const roomTypes = Array.isArray(roomClass['roomTypes']) ? roomClass['roomTypes'] : [];
    const roomCount = roomTypes.reduce((sum, roomType) => {
      const rooms = (roomType as Record<string, unknown>)['rooms'];
      return sum + (Array.isArray(rooms) ? rooms.length : 0);
    }, 0);

    const result: Record<string, unknown> = {
      roomClassId: roomClass['roomClassId'],
      roomClassName: roomClass['roomClassName'],
      summary: {
        roomTypeCount: roomTypes.length,
        roomCount,
      },
    };

    if (detail) {
      result['roomTypes'] = roomTypes.map((roomType) => {
        const item = roomType as Record<string, unknown>;
        return {
          roomTypeId: item['roomTypeId'],
          roomTypeName: item['roomTypeName'],
          roomTypeNameShort: item['roomTypeNameShort'],
        };
      });
    }

    return result;
  }

  private mapRequestType(requestType: Record<string, unknown>, includePrices: boolean) {
    const result: Record<string, unknown> = {
      requestTypeId: requestType['requestTypeId'],
      requestTypeName: requestType['requestTypeName'],
      requestTypeNameEn: requestType['requestTypeNameEn'],
      category: requestType['category'],
      taxFreeDefault: requestType['taxFreeDefault'],
      isRefund: requestType['isRefund'],
    };

    if (includePrices && Array.isArray(requestType['servicePrices'])) {
      result['servicePrices'] = requestType['servicePrices'].map((item) => this.toPlain(item));
    }

    return result;
  }

  private mapRent(rent: Record<string, unknown>) {
    const roomType = rent['roomType'] as Record<string, unknown> | undefined;
    const roomClass = roomType?.['roomClass'] as Record<string, unknown> | undefined;
    const stayType = rent['stayType'] as Record<string, unknown> | undefined;

    return {
      rentId: rent['rentId'],
      depositFlag: rent['depositFlag'],
      roomType: roomType
        ? {
            roomTypeId: roomType['roomTypeId'],
            roomTypeName: roomType['roomTypeName'],
            roomTypeNameShort: roomType['roomTypeNameShort'],
            roomClass: roomClass
              ? {
                  roomClassId: roomClass['roomClassId'],
                  roomClassName: roomClass['roomClassName'],
                }
              : null,
          }
        : null,
      stayType: stayType
        ? {
            stayTypeId: stayType['stayTypeId'],
            stayTypeName: stayType['stayTypeName'],
          }
        : null,
      depositPay: this.toPlain(rent['depositPay']),
      depositPayOver3: this.toPlain(rent['depositPayOver3']),
      dayRent: rent['dayRent'],
      monthRent: this.toPlain(rent['monthRent']),
      dayRentOver3: rent['dayRentOver3'],
      monthRentOver3: this.toPlain(rent['monthRentOver3']),
    };
  }

  private mapRoomSummary(room: Record<string, unknown>) {
    const roomType = room['roomType'] as Record<string, unknown> | undefined;
    const roomClass = roomType?.['roomClass'] as Record<string, unknown> | undefined;
    return {
      roomId: room['roomId'],
      roomNumber: room['roomNumber'],
      roomStatus: room['roomStatus'],
      roomType: roomType
        ? {
            roomTypeId: roomType['roomTypeId'],
            roomTypeName: roomType['roomTypeName'],
            roomTypeNameShort: roomType['roomTypeNameShort'],
            roomClass: roomClass
              ? {
                  roomClassId: roomClass['roomClassId'],
                  roomClassName: roomClass['roomClassName'],
                }
              : null,
          }
        : null,
    };
  }

  private mapRoomTypeBrief(roomType: Record<string, unknown>) {
    const roomClass = roomType['roomClass'] as Record<string, unknown> | undefined;
    return {
      roomTypeId: roomType['roomTypeId'],
      roomTypeName: roomType['roomTypeName'],
      roomTypeNameShort: roomType['roomTypeNameShort'],
      roomClass: roomClass ? this.mapRoomClassBrief(roomClass) : null,
    };
  }

  private mapRoomClassBrief(roomClass: Record<string, unknown>) {
    return {
      roomClassId: roomClass['roomClassId'],
      roomClassName: roomClass['roomClassName'],
    };
  }

  private toPlain(value: unknown): unknown {
    if (typeof value === 'bigint') return Number(value);
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => this.toPlain(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.toPlain(item)]),
      );
    }
    return value;
  }
}
