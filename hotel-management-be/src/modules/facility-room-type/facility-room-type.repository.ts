import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { FacilityAcreageDto } from './dto';

@Injectable()
export class FacilityRoomTypeRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Build the matrix: facilities × room types with acreage + isExists.
   */
  async getMatrix() {
    const [facilities, roomTypes, rooms, facilityRoomTypes] = await Promise.all([
      this.prisma.facility.findMany({
        where: { deletedAt: null, dataStatus: 1 },
        orderBy: { orderNum: 'asc' },
        select: {
          facilityId: true,
          facilityName: true,
          colorOption: true,
        },
      }),
      this.prisma.roomType.findMany({
        where: { deletedAt: null, dataStatus: 1 },
        orderBy: { orderNum: 'asc' },
        select: {
          roomTypeId: true,
          roomTypeNameShort: true,
          roomTypeName: true,
        },
      }),
      this.prisma.room.findMany({
        where: { deletedAt: null, dataStatus: 1 },
        select: {
          facilityId: true,
          roomTypeId: true,
        },
      }),
      this.prisma.facilityRoomType.findMany({
        where: { deletedAt: null },
        select: {
          facilityId: true,
          roomTypeId: true,
          acreage: true,
        },
      }),
    ]);

    // Build lookup: Set of "facilityId-roomTypeId" for rooms that exist
    const roomExistsSet = new Set<string>();
    for (const room of rooms) {
      roomExistsSet.add(`${room.facilityId}-${room.roomTypeId}`);
    }

    // Build lookup: Map of "facilityId-roomTypeId" → acreage
    const acreageMap = new Map<string, string | null>();
    for (const frt of facilityRoomTypes) {
      acreageMap.set(`${frt.facilityId}-${frt.roomTypeId}`, frt.acreage);
    }

    return { facilities, roomTypes, roomExistsSet, acreageMap };
  }

  /**
   * Upsert all acreage values in a transaction.
   */
  async upsertMatrix(facilities: FacilityAcreageDto[], staffId: number) {
    const operations = facilities.flatMap((facility) =>
      facility.roomTypes.map((rt) =>
        this.prisma.facilityRoomType.upsert({
          where: {
            facilityId_roomTypeId: {
              facilityId: facility.facilityId,
              roomTypeId: rt.roomTypeId,
            },
          },
          create: {
            facilityId: facility.facilityId,
            roomTypeId: rt.roomTypeId,
            acreage: rt.acreage,
            createdStaffId: staffId,
            updatedStaffId: staffId,
          },
          update: {
            acreage: rt.acreage,
            updatedStaffId: staffId,
          },
        }),
      ),
    );

    // Batch in chunks of 100 inside a transaction
    const chunkSize = 100;
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < operations.length; i += chunkSize) {
        await Promise.all(
          facilities
            .flatMap((facility) =>
              facility.roomTypes.map((rt) =>
                tx.facilityRoomType.upsert({
                  where: {
                    facilityId_roomTypeId: {
                      facilityId: facility.facilityId,
                      roomTypeId: rt.roomTypeId,
                    },
                  },
                  create: {
                    facilityId: facility.facilityId,
                    roomTypeId: rt.roomTypeId,
                    acreage: rt.acreage,
                    createdStaffId: staffId,
                    updatedStaffId: staffId,
                  },
                  update: {
                    acreage: rt.acreage,
                    updatedStaffId: staffId,
                  },
                }),
              ),
            )
            .slice(i, i + chunkSize),
        );
      }
    });
  }
}
