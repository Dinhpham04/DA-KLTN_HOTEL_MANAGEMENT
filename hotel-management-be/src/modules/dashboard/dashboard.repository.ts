import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { DataStatus } from '@common/enums/index';

export interface ReserveWithRoom {
  reserveId: number;
  roomId: number | null;
  periodFrom: Date | null;
  periodTo: Date | null;
  confirmFlag: boolean;
}

export interface RoomWithClass {
  roomId: number;
  roomClassId: number;
}

export interface RoomClassMaster {
  roomClassId: number;
  roomClassName: string;
  orderNum: number;
}

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoomClasses(): Promise<RoomClassMaster[]> {
    return this.prisma.roomClass.findMany({
      where: { deletedAt: null, dataStatus: DataStatus.AVAILABLE },
      orderBy: [{ orderNum: 'asc' }, { roomClassId: 'asc' }],
      select: {
        roomClassId: true,
        roomClassName: true,
        orderNum: true,
      },
    });
  }

  async findAvailableRooms(): Promise<RoomWithClass[]> {
    const rooms = await this.prisma.room.findMany({
      where: { deletedAt: null, dataStatus: DataStatus.AVAILABLE },
      select: {
        roomId: true,
        roomType: { select: { roomClassId: true } },
      },
    });
    return rooms.map((r) => ({
      roomId: r.roomId,
      roomClassId: r.roomType.roomClassId,
    }));
  }

  async findReservesInRange(
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<ReserveWithRoom[]> {
    return this.prisma.reserve.findMany({
      where: {
        deletedAt: null,
        dataStatus: DataStatus.AVAILABLE,
        deleteStatus: null,
        memoFlag: false,
        rakutenFlag: false,
        draftFlag: false,
        roomId: { not: null },
        periodFrom: { lte: rangeEnd },
        OR: [{ periodTo: null }, { periodTo: { gt: rangeStart } }],
      },
      select: {
        reserveId: true,
        roomId: true,
        periodFrom: true,
        periodTo: true,
        confirmFlag: true,
      },
    });
  }

  async findResidualRoom(idYmd: string): Promise<number | null> {
    const row = await this.prisma.residualRoom.findUnique({
      where: { id: idYmd },
      select: { number: true },
    });
    return row?.number ?? null;
  }

  async upsertResidualRoom(
    idYmd: string,
    number: number,
    staffId: number,
  ): Promise<void> {
    await this.prisma.residualRoom.upsert({
      where: { id: idYmd },
      create: {
        id: idYmd,
        number,
        createdStaffId: staffId,
        updatedStaffId: staffId,
      },
      update: {
        number,
        updatedStaffId: staffId,
      },
    });
  }

  async findAnnouncementsByDate(
    date: Date,
    page: number,
    perPage: number,
  ): Promise<{
    items: Array<{
      announcementId: number;
      detail: string;
      orderNum: number;
      dataStatus: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
  }> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const where = {
      deletedAt: null,
      createdAt: { gte: start, lte: end },
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.announcement.count({ where }),
      this.prisma.announcement.findMany({
        where,
        orderBy: [{ orderNum: 'asc' }, { announcementId: 'asc' }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          announcementId: true,
          detail: true,
          orderNum: true,
          dataStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);
    return { items, total };
  }

  async findOrCreateSaleSetting(): Promise<{
    settingId: number;
    defaultSaleDate: Date;
  }> {
    const existing = await this.prisma.saleSetting.findFirst({
      orderBy: { settingId: 'asc' },
      select: { settingId: true, defaultSaleDate: true },
    });
    if (existing) return existing;

    return this.prisma.saleSetting.create({
      data: { defaultSaleDate: new Date() },
      select: { settingId: true, defaultSaleDate: true },
    });
  }

  async updateSaleSettingDate(
    settingId: number,
    defaultSaleDate: Date,
  ): Promise<void> {
    await this.prisma.saleSetting.update({
      where: { settingId },
      data: { defaultSaleDate },
    });
  }
}

