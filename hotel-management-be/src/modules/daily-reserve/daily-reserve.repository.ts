import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';

const DATA_STATUS_AVAILABLE = 1;
const ROOM_CLEANING_TYPE = 1;
const SMART_LOCK_ACTIVE = 1;

export const DAILY_RESERVE_INCLUDE = {
  client: {
    select: {
      clientId: true,
      clientName: true,
      clientNameEn: true,
      companyName: true,
      companyNameEn: true,
      contactName: true,
      dataType: true,
      postpaidFlag: true,
    },
  },
  facility: {
    select: {
      facilityId: true,
      facilityNo: true,
      facilityName: true,
    },
  },
  room: {
    select: {
      roomId: true,
      roomNumber: true,
    },
  },
  chargeStaff: {
    select: {
      staffId: true,
      staffName: true,
      staffNameShort: true,
    },
  },
  diContactStaff: {
    select: {
      staffId: true,
      staffName: true,
      staffNameShort: true,
    },
  },
  checkinReceptionist: {
    select: {
      staffId: true,
      staffName: true,
      staffNameShort: true,
    },
  },
  reserveOccupiers: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
    select: {
      occupierName: true,
    },
  },
  usageStatuses: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
      constructionId: null,
    },
    orderBy: {
      usageStatusId: 'desc',
    },
    take: 1,
    select: {
      usageStatusId: true,
      facilityId: true,
      roomId: true,
      periodFrom: true,
      periodTo: true,
    },
  },
  pinCredentials: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
      status: SMART_LOCK_ACTIVE,
    },
    orderBy: [
      {
        issuedAt: 'desc',
      },
      {
        roomPinCredentialId: 'desc',
      },
    ],
    take: 1,
    select: {
      roomPinCredentialId: true,
      maskedPin: true,
      validFrom: true,
      validTo: true,
      status: true,
    },
  },
  parkingReserves: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
    },
    select: {
      parkingReserveId: true,
      periodFrom: true,
      periodTo: true,
      checkinFlag: true,
      checkoutFlag: true,
      parking: {
        select: {
          number: true,
          parentFacility: {
            select: {
              facilityName: true,
            },
          },
        },
      },
    },
  },
  bicycleParkingReserves: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
    },
    select: {
      bicycleParkingReserveId: true,
      periodFrom: true,
      periodTo: true,
      checkinFlag: true,
      checkoutFlag: true,
      bicycleParking: {
        select: {
          number: true,
          parentFacility: {
            select: {
              facilityName: true,
            },
          },
        },
      },
    },
  },
  cleaningDetails: {
    where: {
      dataStatus: DATA_STATUS_AVAILABLE,
      deletedAt: null,
      dataType: ROOM_CLEANING_TYPE,
    },
    orderBy: {
      cleaningDetailId: 'desc',
    },
    take: 1,
    select: {
      cleaningDetailId: true,
      cleanStatus: true,
      scheduledDate: true,
    },
  },
} satisfies Prisma.ReserveInclude;

export type DailyReserveEntity = Prisma.ReserveGetPayload<{
  include: typeof DAILY_RESERVE_INCLUDE;
}>;

@Injectable()
export class DailyReserveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDailyReserves(params: {
    start: Date;
    end: Date;
    chargeStaffId?: number;
  }): Promise<DailyReserveEntity[]> {
    return this.prisma.reserve.findMany({
      where: {
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        deleteStatus: null,
        draftFlag: false,
        memoFlag: false,
        rakutenFlag: false,
        periodFrom: {
          gte: params.start,
          lt: params.end,
        },
        ...(params.chargeStaffId !== undefined && {
          chargeStaffId: params.chargeStaffId,
        }),
      },
      include: DAILY_RESERVE_INCLUDE,
      orderBy: [
        {
          facility: {
            facilityNo: 'asc',
          },
        },
        {
          room: {
            roomNumber: 'asc',
          },
        },
        {
          reserveId: 'asc',
        },
      ],
    });
  }

  async findById(id: number): Promise<DailyReserveEntity | null> {
    return this.prisma.reserve.findFirst({
      where: {
        reserveId: id,
        deletedAt: null,
      },
      include: DAILY_RESERVE_INCLUDE,
    });
  }

  async updateReserve(
    id: number,
    data: Prisma.ReserveUpdateInput,
  ): Promise<DailyReserveEntity> {
    return this.prisma.reserve.update({
      where: {
        reserveId: id,
      },
      data,
      include: DAILY_RESERVE_INCLUDE,
    });
  }

  async findFirstReserveDatesByClient(clientIds: number[]) {
    return this.prisma.reserve.groupBy({
      by: ['clientId'],
      where: {
        clientId: {
          in: clientIds,
        },
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        draftFlag: false,
        memoFlag: false,
        rakutenFlag: false,
        deleteStatus: null,
      },
      _min: {
        periodFrom: true,
      },
    });
  }

  async findFutureReservesForRooms(roomIds: number[], minPeriodFrom: Date) {
    return this.prisma.reserve.findMany({
      where: {
        roomId: {
          in: roomIds,
        },
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        deleteStatus: null,
        draftFlag: false,
        memoFlag: false,
        rakutenFlag: false,
        periodFrom: {
          gte: minPeriodFrom,
        },
      },
      select: {
        reserveId: true,
        roomId: true,
        periodFrom: true,
      },
      orderBy: [
        {
          roomId: 'asc',
        },
        {
          periodFrom: 'asc',
        },
      ],
    });
  }

  async findLatestCleaningByRoom(roomId: number, reserveId: number) {
    return this.prisma.cleaningDetail.findFirst({
      where: {
        roomId,
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        dataType: ROOM_CLEANING_TYPE,
        reserveId: {
          not: reserveId,
        },
      },
      orderBy: {
        cleaningDetailId: 'desc',
      },
      select: {
        cleaningDetailId: true,
        cleanStatus: true,
      },
    });
  }

  async findPreviousReserveForRoom(roomId: number, periodFrom: Date, reserveId: number) {
    return this.prisma.reserve.findFirst({
      where: {
        roomId,
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        deleteStatus: null,
        reserveId: {
          not: reserveId,
        },
        periodFrom: {
          lte: periodFrom,
        },
      },
      orderBy: [
        {
          periodFrom: 'desc',
        },
        {
          reserveId: 'desc',
        },
      ],
      select: {
        reserveId: true,
        checkinFlag: true,
        checkoutAt: true,
        keyReturnDatetime: true,
        checkoutReceptionistId: true,
        rentalKeys: true,
        returnKeys: true,
      },
    });
  }

  async findLatestCredentialByReserveId(reserveId: number) {
    return this.prisma.roomPinCredential.findFirst({
      where: {
        reserveId,
        dataStatus: DATA_STATUS_AVAILABLE,
        deletedAt: null,
        status: SMART_LOCK_ACTIVE,
      },
      orderBy: [
        {
          issuedAt: 'desc',
        },
        {
          roomPinCredentialId: 'desc',
        },
      ],
    });
  }

  async createSmartLockCredential(data: Prisma.RoomPinCredentialUncheckedCreateInput) {
    return this.prisma.roomPinCredential.create({ data });
  }

  async updateSmartLockCredential(
    id: number,
    data: Prisma.RoomPinCredentialUncheckedUpdateInput,
  ) {
    return this.prisma.roomPinCredential.update({
      where: {
        roomPinCredentialId: id,
      },
      data,
    });
  }

  async markParkingCheckedIn(reserveId: number): Promise<void> {
    await Promise.all([
      this.prisma.parkingReserve.updateMany({
        where: {
          reserveId,
          dataStatus: DATA_STATUS_AVAILABLE,
          deletedAt: null,
        },
        data: {
          checkinFlag: true,
        },
      }),
      this.prisma.bicycleParkingReserve.updateMany({
        where: {
          reserveId,
          dataStatus: DATA_STATUS_AVAILABLE,
          deletedAt: null,
        },
        data: {
          checkinFlag: true,
        },
      }),
    ]);
  }
}
