import { Injectable } from '@nestjs/common';
import {
  DashboardRepository,
  ReserveWithRoom,
  RoomClassMaster,
  RoomWithClass,
} from './dashboard.repository';
import {
  AnnouncementFilterDto,
  AnnouncementListResponseDto,
  DailyBusinessFilterDto,
  DailyBusinessResponseDto,
  RoomClassCountsDto,
  SaleDateUpdateType,
  SaleSettingResponseDto,
  UpdateSaleDateDto,
  UpsertResidualRoomDto,
} from './dto';

const MS_PER_DAY = 86_400_000;
const WEEKDAY_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getDailyBusiness(
    filter: DailyBusinessFilterDto,
  ): Promise<DailyBusinessResponseDto> {
    const targetDate = this.parseDate(filter.date) ?? this.startOfDay(new Date());
    const previousDay = this.addDays(targetDate, -1);
    const weekStart = this.startOfWeekMonday(previousDay);

    const [roomClasses, rooms, reserves] = await Promise.all([
      this.repository.findRoomClasses(),
      this.repository.findAvailableRooms(),
      this.repository.findReservesInRange(weekStart, targetDate),
    ]);

    const totalRoom = rooms.length;

    let emptyRoomSum = 0;
    for (
      let cursor = new Date(weekStart);
      cursor <= previousDay;
      cursor = this.addDays(cursor, 1)
    ) {
      const occupied = this.occupiedRoomIdsOn(reserves, cursor);
      emptyRoomSum += totalRoom - occupied.size;
    }

    const todayCounts = this.computePerClass(rooms, reserves, targetDate);
    const yesterdayCounts = this.computePerClass(rooms, reserves, previousDay);

    const checkInOut = this.computeCheckInOut(rooms, reserves, targetDate, previousDay);
    const totalRoomEmptyToday = todayCounts.totalEmpty;
    const totalReserves = totalRoom - totalRoomEmptyToday;

    const arrivingRooms = this.distinctRoomsWithPeriod(
      reserves,
      'periodFrom',
      targetDate,
    );
    const departingRooms = this.distinctRoomsWithPeriod(
      reserves,
      'periodTo',
      previousDay,
      true,
    );

    const idYmd = this.formatYmd(targetDate);
    const targetNumber = await this.repository.findResidualRoom(idYmd);
    const targetResidualRoom = {
      id: targetNumber === null ? null : idYmd,
      number: targetNumber ?? Math.max(0, totalRoomEmptyToday - 5),
    };

    const countTypeByClass = this.countTypeByClass(rooms);

    const buildClass = (cls: RoomClassMaster): RoomClassCountsDto => ({
      roomClassId: cls.roomClassId,
      roomClassName: cls.roomClassName,
      orderNum: cls.orderNum,
      countRoomClassEmptyBefore:
        yesterdayCounts.emptyByClass.get(cls.roomClassId) ?? 0,
      countRoomClassEmptyToday:
        todayCounts.emptyByClass.get(cls.roomClassId) ?? 0,
      selectedCheckinDate: checkInOut.checkinByClass.get(cls.roomClassId) ?? 0,
      selectedCheckoutDate:
        checkInOut.checkoutByClass.get(cls.roomClassId) ?? 0,
      countTypeRoom: countTypeByClass.get(cls.roomClassId) ?? 0,
    });

    return {
      businesses: {
        roomCounts: {
          roomClasses: roomClasses.map(buildClass),
          totalReserves,
          arrivingRooms,
          departingRooms,
          totalRoomEmptyToday,
          totalRoom,
          emptyRoom: emptyRoomSum,
          formattedCurrentTime: this.formatLongDate(targetDate),
        },
        targetResidualRoom,
      },
    };
  }

  async upsertResidualRoom(
    dto: UpsertResidualRoomDto,
    staffId: number,
  ): Promise<{ statusCode: number }> {
    const date = this.parseDate(dto.date);
    if (!date) return { statusCode: 400 };
    const idYmd = this.formatYmd(date);
    await this.repository.upsertResidualRoom(idYmd, dto.number, staffId);
    return { statusCode: 200 };
  }

  async getAnnouncements(
    filter: AnnouncementFilterDto,
  ): Promise<AnnouncementListResponseDto> {
    const date = this.parseDate(filter.date) ?? this.startOfDay(new Date());
    const { items, total } = await this.repository.findAnnouncementsByDate(
      date,
      filter.page,
      filter.perPage,
    );
    return {
      announcements: items.map((a) => ({
        announcementId: a.announcementId,
        detail: a.detail,
        orderNum: a.orderNum,
        dataStatus: a.dataStatus,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        perPage: filter.perPage,
        currentPage: filter.page,
        lastPage: Math.max(1, Math.ceil(total / filter.perPage)),
      },
    };
  }

  async getSaleSetting(): Promise<SaleSettingResponseDto> {
    const setting = await this.repository.findOrCreateSaleSetting();
    return {
      setting: {
        settingId: setting.settingId,
        defaultSaleDate: this.formatSlashDate(setting.defaultSaleDate),
      },
    };
  }

  async updateSaleDate(dto: UpdateSaleDateDto): Promise<{ statusCode: number }> {
    const setting = await this.repository.findOrCreateSaleSetting();
    const today = this.startOfDay(new Date());
    const newDate =
      dto.type === SaleDateUpdateType.ADD ? this.addDays(today, 1) : today;
    await this.repository.updateSaleSettingDate(setting.settingId, newDate);
    return { statusCode: 200 };
  }

  // ─── Helpers ────────────────────────────────────────

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const normalized = value.replace(/\//g, '-');
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return null;
    return this.startOfDay(parsed);
  }

  private startOfDay(date: Date): Date {
    const out = new Date(date);
    out.setHours(0, 0, 0, 0);
    return out;
  }

  private addDays(date: Date, days: number): Date {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    return out;
  }

  private startOfWeekMonday(date: Date): Date {
    const out = this.startOfDay(date);
    const day = out.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return this.addDays(out, diffToMonday);
  }

  private formatYmd(date: Date): string {
    const y = date.getFullYear().toString().padStart(4, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}${m}${d}`;
  }

  private formatSlashDate(date: Date): string {
    const y = date.getFullYear().toString().padStart(4, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  private formatLongDate(date: Date): string {
    const weekday = WEEKDAY_VI[date.getDay()];
    return `${date.getFullYear()} năm ${date.getMonth() + 1} tháng ${date.getDate()} (${weekday})`;
  }

  private occupiedRoomIdsOn(
    reserves: ReserveWithRoom[],
    day: Date,
  ): Set<number> {
    const set = new Set<number>();
    const dayMs = day.getTime();
    for (const r of reserves) {
      if (r.roomId === null || r.periodFrom === null) continue;
      const fromMs = this.startOfDay(r.periodFrom).getTime();
      if (fromMs > dayMs) continue;
      if (r.periodTo === null) {
        set.add(r.roomId);
        continue;
      }
      const toMs = this.startOfDay(r.periodTo).getTime();
      // Legacy semantics: room becomes free on the checkout day itself
      if (toMs > dayMs) set.add(r.roomId);
    }
    return set;
  }

  private computePerClass(
    rooms: RoomWithClass[],
    reserves: ReserveWithRoom[],
    day: Date,
  ): { totalEmpty: number; emptyByClass: Map<number, number> } {
    const occupied = this.occupiedRoomIdsOn(reserves, day);
    const emptyByClass = new Map<number, number>();
    let totalEmpty = 0;
    for (const room of rooms) {
      if (occupied.has(room.roomId)) continue;
      totalEmpty += 1;
      emptyByClass.set(
        room.roomClassId,
        (emptyByClass.get(room.roomClassId) ?? 0) + 1,
      );
    }
    return { totalEmpty, emptyByClass };
  }

  private countTypeByClass(rooms: RoomWithClass[]): Map<number, number> {
    const map = new Map<number, number>();
    for (const room of rooms) {
      map.set(room.roomClassId, (map.get(room.roomClassId) ?? 0) + 1);
    }
    return map;
  }

  private computeCheckInOut(
    rooms: RoomWithClass[],
    reserves: ReserveWithRoom[],
    targetDate: Date,
    previousDay: Date,
  ): {
    checkinByClass: Map<number, number>;
    checkoutByClass: Map<number, number>;
  } {
    const roomToClass = new Map(rooms.map((r) => [r.roomId, r.roomClassId]));
    const targetMs = targetDate.getTime();
    const prevMs = previousDay.getTime();
    const checkinSeen = new Map<number, Set<number>>();
    const checkoutSeen = new Map<number, Set<number>>();

    for (const r of reserves) {
      if (r.roomId === null) continue;
      const cls = roomToClass.get(r.roomId);
      if (cls === undefined) continue;

      if (
        r.periodFrom &&
        this.startOfDay(r.periodFrom).getTime() === targetMs
      ) {
        if (!checkinSeen.has(cls)) checkinSeen.set(cls, new Set());
        checkinSeen.get(cls)!.add(r.roomId);
      }

      if (
        r.periodTo &&
        r.confirmFlag &&
        this.startOfDay(r.periodTo).getTime() === prevMs
      ) {
        if (!checkoutSeen.has(cls)) checkoutSeen.set(cls, new Set());
        checkoutSeen.get(cls)!.add(r.roomId);
      }
    }

    const checkinByClass = new Map<number, number>();
    for (const [cls, set] of checkinSeen) checkinByClass.set(cls, set.size);
    const checkoutByClass = new Map<number, number>();
    for (const [cls, set] of checkoutSeen) checkoutByClass.set(cls, set.size);

    return { checkinByClass, checkoutByClass };
  }

  private distinctRoomsWithPeriod(
    reserves: ReserveWithRoom[],
    field: 'periodFrom' | 'periodTo',
    day: Date,
    requireConfirm = false,
  ): number {
    const dayMs = day.getTime();
    const seen = new Set<number>();
    for (const r of reserves) {
      if (r.roomId === null) continue;
      if (requireConfirm && !r.confirmFlag) continue;
      const value = r[field];
      if (!value) continue;
      if (this.startOfDay(value).getTime() === dayMs) seen.add(r.roomId);
    }
    return seen.size;
  }
}
