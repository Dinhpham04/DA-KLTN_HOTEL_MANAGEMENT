import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ParkingStatusFilterDto } from './dto';

@Injectable()
export class ParkingStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all facilities that have parking or bicycle parking,
   * including their parking slots and reservations.
   */
  async findFacilitiesWithParkingStatus(filter: ParkingStatusFilterDto) {
    const includeParking = !filter.type || filter.type === 1 || filter.type === 2;
    const includeBicycle = !filter.type || filter.type === 1 || filter.type === 3;

    return this.prisma.facility.findMany({
      where: {
        deletedAt: null,
        ...(filter.facilityId && { facilityId: filter.facilityId }),
        OR: [
          ...(includeParking ? [{ parkingFlag: true }] : []),
          ...(includeBicycle ? [{ bicycleParkingFlag: true }] : []),
        ],
      },
      include: {
        parkings: includeParking
          ? {
              where: { deletedAt: null },
              orderBy: { orderNum: 'asc' },
              include: {
                parkingRents: {
                  where: { deletedAt: null },
                  orderBy: { stayTypeId: 'asc' },
                },
                parkingReserves: {
                  where: { deletedAt: null },
                  orderBy: { periodFrom: 'asc' },
                  include: {
                    client: {
                      select: {
                        clientName: true,
                        dataType: true,
                      },
                    },
                    reserve: {
                      select: {
                        periodFrom: true,
                        periodTo: true,
                        chargeStaffId: true,
                        facilityId: true,
                        roomId: true,
                        checkinFlag: true,
                        room: {
                          select: {
                            roomNumber: true,
                          },
                        },
                        facility: {
                          select: {
                            facilityNo: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            }
          : false,
        bicycleParkings: includeBicycle
          ? {
              where: { deletedAt: null },
              orderBy: { orderNum: 'asc' },
              include: {
                bicycleParkingReserves: {
                  where: { deletedAt: null },
                  orderBy: { periodFrom: 'asc' },
                  include: {
                    client: {
                      select: {
                        clientName: true,
                        dataType: true,
                      },
                    },
                    reserve: {
                      select: {
                        periodFrom: true,
                        periodTo: true,
                        chargeStaffId: true,
                        facilityId: true,
                        roomId: true,
                        checkinFlag: true,
                        room: {
                          select: {
                            roomNumber: true,
                          },
                        },
                        facility: {
                          select: {
                            facilityNo: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            }
          : false,
      },
      orderBy: { orderNum: 'asc' },
    });
  }
}
