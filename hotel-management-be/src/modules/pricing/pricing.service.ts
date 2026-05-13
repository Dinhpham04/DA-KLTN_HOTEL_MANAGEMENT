import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import {
  CalculateFeesDto,
  CalculateFeesResponseDto,
  CountUnit,
  ParkingFeeDto,
  RentFeeDto,
  RequestTypeFilterDto,
  RequestTypeResponseDto,
  ServiceFeeDto,
} from './dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const TAX_RATE = 0.1;

const STAY_TYPE_DAY = 3;
const STAY_TYPE_MONTH = 4;

const REQUEST_TYPE_MANAGEMENT_FEE = 7;
const REQUEST_TYPE_UTILITY_FEE = 8;
const REQUEST_TYPE_CLEANING_FEE = 9;

const PARKING_STAY_TYPE_SHORT_DAY = 1;
const PARKING_STAY_TYPE_LONG_DAY = 2;
const PARKING_STAY_TYPE_MONTHLY = 5;
const PARKING_STAY_TYPE_QUARTERLY = 7;

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async findRequestTypes(filter: RequestTypeFilterDto): Promise<RequestTypeResponseDto[]> {
    const requestTypes = await this.prisma.requestType.findMany({
      where: {
        dataStatus: 1,
        deletedAt: null,
        ...(filter.category ? { category: filter.category } : {}),
      },
      orderBy: [{ orderNum: 'asc' }, { requestTypeId: 'asc' }],
    });

    return requestTypes.map((rt) => RequestTypeResponseDto.fromEntity(rt));
  }

  async calculateFees(dto: CalculateFeesDto): Promise<CalculateFeesResponseDto> {
    const periodFromDate = new Date(dto.periodFrom);
    const periodToDate = new Date(dto.periodTo);

    if (periodToDate.getTime() < periodFromDate.getTime()) {
      throw new NotFoundException('periodTo must not be before periodFrom');
    }

    const peopleCount = (dto.peopleCount ?? 1) as 1 | 2;

    const rentFee = await this.calculateRentFee(
      dto.roomTypeId,
      dto.stayTypeId,
      periodFromDate,
      periodToDate,
      peopleCount,
    );

    const rentExtraFees = await this.calculateRentExtraFees(
      dto.roomTypeId,
      dto.stayTypeId,
      periodFromDate,
      periodToDate,
      peopleCount,
    );

    const serviceFees = await this.calculateServiceFees(
      dto.serviceTypeIds ?? [],
      periodFromDate,
      periodToDate,
      dto.countUnit,
      dto.facilityId,
    );

    let parkingFee: ParkingFeeDto | undefined;
    if (dto.parkingId) {
      const fee = await this.calculateParkingFee(
        dto.parkingId,
        periodFromDate,
        periodToDate,
        dto.countUnit,
      );
      if (fee) {
        parkingFee = fee;
      }
    }

    const isTaxFree = this.isOneMonth(periodFromDate, periodToDate);

    const subtotal =
      rentFee.totalPrice +
      rentExtraFees.reduce((sum, f) => sum + f.totalPrice, 0) +
      serviceFees.reduce((sum, f) => sum + f.totalPrice, 0) +
      (parkingFee?.totalPrice ?? 0);

    const tax = isTaxFree ? 0 : Math.round(subtotal * TAX_RATE);

    return {
      rentFee,
      rentExtraFees,
      serviceFees,
      parkingFee,
      isTaxFree,
      subtotal,
      tax,
      totalPrice: subtotal + tax,
    };
  }

  private async findRent(roomTypeId: number, stayTypeId: number) {
    const rent = await this.prisma.rent.findFirst({
      where: {
        roomTypeId,
        stayTypeId,
        dataStatus: 1,
        deletedAt: null,
      },
    });

    if (!rent) {
      throw new NotFoundException(
        `Rent not found for roomTypeId=${roomTypeId}, stayTypeId=${stayTypeId}`,
      );
    }

    return rent;
  }

  private async calculateRentFee(
    roomTypeId: number,
    stayTypeId: number,
    periodFrom: Date,
    periodTo: Date,
    peopleCount: 1 | 2,
  ): Promise<RentFeeDto> {
    const rent = await this.findRent(roomTypeId, stayTypeId);

    const days = this.diffDaysInclusive(periodFrom, periodTo);
    const isOver3 = peopleCount === 2;

    let unitPrice = 0;
    const count = days;
    let description = '';

    if (stayTypeId === STAY_TYPE_DAY) {
      unitPrice = isOver3 ? (rent.dayRentOver3 ?? rent.dayRent ?? 0) : (rent.dayRent ?? 0);
      description = `Daily rent × ${days} days`;
    } else if (stayTypeId === STAY_TYPE_MONTH) {
      const monthRent = isOver3
        ? Number(rent.monthRentOver3 ?? rent.monthRent ?? 0)
        : Number(rent.monthRent ?? 0);
      const cleanFee = isOver3
        ? Number(rent.dayCleanFeeOver3 ?? rent.dayCleanFee ?? 0)
        : Number(rent.dayCleanFee ?? 0);
      const mainteFee = Number(rent.dayMainteFee ?? 0);
      const utilityFee = Number(rent.dayUtilityFee ?? 0);
      unitPrice =
        monthRent > 0
          ? Math.round((monthRent - (cleanFee + mainteFee + utilityFee) * 30) / 30)
          : 0;
      description = `Monthly rent (per day basis) × ${days} days`;
    } else {
      const monthRent = isOver3 ? Number(rent.monthRentOver3 ?? 0) : Number(rent.monthRent ?? 0);

      if (monthRent > 0) {
        const cleanFee = isOver3
          ? Number(rent.dayCleanFeeOver3 ?? rent.dayCleanFee ?? 0)
          : Number(rent.dayCleanFee ?? 0);
        const mainteFee = Number(rent.dayMainteFee ?? 0);
        const utilityFee = Number(rent.dayUtilityFee ?? 0);
        unitPrice = Math.round((monthRent - (cleanFee + mainteFee + utilityFee) * 30) / 30);
      } else {
        unitPrice = isOver3 ? (rent.dayRentOver3 ?? rent.dayRent ?? 0) : (rent.dayRent ?? 0);
      }
      description = `Rent × ${days} days`;
    }

    return {
      unitPrice,
      count,
      totalPrice: unitPrice * count,
      description,
    };
  }

  private async calculateServiceFees(
    serviceTypeIds: number[],
    periodFrom: Date,
    periodTo: Date,
    countUnit: CountUnit,
    facilityId?: number,
  ): Promise<ServiceFeeDto[]> {
    if (serviceTypeIds.length === 0) {
      return [];
    }

    const days = this.diffDaysInclusive(periodFrom, periodTo);
    const count = this.unitCount(days, countUnit);

    const periodFromIso = this.startOfDay(periodFrom);
    const periodToIso = this.startOfDay(periodTo);

    const servicePrices = await this.prisma.servicePrice.findMany({
      where: {
        requestTypeId: { in: serviceTypeIds },
        dataStatus: 1,
        deletedAt: null,
        OR: [{ facilityId: null }, ...(facilityId ? [{ facilityId }] : [])],
        AND: [
          {
            OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: periodToIso } }],
          },
          {
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodFromIso } }],
          },
        ],
      },
      include: {
        requestType: true,
      },
      orderBy: [
        { facilityId: 'desc' }, // facility-specific first (NULLs last)
        { effectiveFrom: 'desc' },
      ],
    });

    // Pick the most specific price per requestTypeId (facility-scoped wins).
    const pickedPrices = new Map<number, (typeof servicePrices)[number]>();
    for (const sp of servicePrices) {
      if (!pickedPrices.has(sp.requestTypeId)) {
        pickedPrices.set(sp.requestTypeId, sp);
      }
    }

    return Array.from(pickedPrices.values()).map((sp) => {
      const unitPrice = Number(sp.unitPrice);
      return {
        requestTypeId: sp.requestTypeId,
        requestTypeName: sp.requestType.requestTypeName,
        unitPrice,
        count,
        countUnit,
        totalPrice: unitPrice * count,
      };
    });
  }

  private async calculateRentExtraFees(
    roomTypeId: number,
    stayTypeId: number,
    periodFrom: Date,
    periodTo: Date,
    peopleCount: 1 | 2,
  ): Promise<ServiceFeeDto[]> {
    const rent = await this.findRent(roomTypeId, stayTypeId);
    const days = this.diffDaysInclusive(periodFrom, periodTo);
    const isOver3 = peopleCount === 2;
    const countUnit = CountUnit.DAY;
    const usesMonthlyFee = false;
    const count = this.unitCount(days, countUnit);

    const feeInputs = usesMonthlyFee
      ? [
          {
            requestTypeId: REQUEST_TYPE_CLEANING_FEE,
            requestTypeName: 'Phí dọn dẹp',
            unitPrice: isOver3
              ? Number(rent.monthCleanFeeOver3 ?? rent.monthCleanFee ?? 0)
              : Number(rent.monthCleanFee ?? 0),
          },
          {
            requestTypeId: REQUEST_TYPE_MANAGEMENT_FEE,
            requestTypeName: 'Phí quản lý',
            unitPrice: Number(rent.monthMainteFee ?? 0),
          },
          {
            requestTypeId: REQUEST_TYPE_UTILITY_FEE,
            requestTypeName: 'Điện nước',
            unitPrice: Number(rent.monthUtilityFee ?? 0),
          },
        ]
      : [
          {
            requestTypeId: REQUEST_TYPE_CLEANING_FEE,
            requestTypeName: 'Phí dọn dẹp',
            unitPrice: isOver3
              ? Number(rent.dayCleanFeeOver3 ?? rent.dayCleanFee ?? 0)
              : Number(rent.dayCleanFee ?? 0),
          },
          {
            requestTypeId: REQUEST_TYPE_MANAGEMENT_FEE,
            requestTypeName: 'Phí quản lý',
            unitPrice: Number(rent.dayMainteFee ?? 0),
          },
          {
            requestTypeId: REQUEST_TYPE_UTILITY_FEE,
            requestTypeName: 'Điện nước',
            unitPrice: Number(rent.dayUtilityFee ?? 0),
          },
        ];

    return feeInputs
      .filter((fee) => fee.unitPrice > 0)
      .map((fee) => ({
        requestTypeId: fee.requestTypeId,
        requestTypeName: fee.requestTypeName,
        unitPrice: fee.unitPrice,
        count,
        countUnit,
        totalPrice: fee.unitPrice * count,
      }));
  }

  private async calculateParkingFee(
    parkingId: number,
    periodFrom: Date,
    periodTo: Date,
    countUnit: CountUnit,
  ): Promise<ParkingFeeDto | null> {
    const parkingRents = await this.prisma.parkingRent.findMany({
      where: {
        parkingId,
        dataStatus: 1,
        deletedAt: null,
      },
    });

    if (parkingRents.length === 0) {
      return null;
    }

    const days = this.diffDaysInclusive(periodFrom, periodTo);
    const count = this.unitCount(days, countUnit);

    const targetStayTypeId = this.parkingStayTypeFor(days, countUnit);

    const matched = parkingRents.find((p) => p.stayTypeId === targetStayTypeId);
    const fallback = parkingRents[0];
    const unitPrice = matched?.rent ?? fallback?.rent ?? 0;

    return {
      parkingId,
      unitPrice,
      count,
      totalPrice: unitPrice * count,
    };
  }

  private parkingStayTypeFor(days: number, countUnit: CountUnit): number {
    if (countUnit === CountUnit.DAY) {
      return days <= 6 ? PARKING_STAY_TYPE_SHORT_DAY : PARKING_STAY_TYPE_LONG_DAY;
    }
    if (countUnit === CountUnit.MONTH) {
      const months = Math.max(1, Math.ceil(days / 30));
      return months <= 2 ? PARKING_STAY_TYPE_MONTHLY : PARKING_STAY_TYPE_QUARTERLY;
    }
    return PARKING_STAY_TYPE_LONG_DAY;
  }

  private unitCount(days: number, countUnit: CountUnit): number {
    if (countUnit === CountUnit.MONTH) {
      return Math.max(1, Math.ceil(days / 30));
    }
    if (countUnit === CountUnit.TIME) {
      return 1;
    }
    return Math.max(1, days);
  }

  private diffDaysInclusive(from: Date, to: Date): number {
    const fromDay = this.startOfDay(from).getTime();
    const toDay = this.startOfDay(to).getTime();
    return Math.max(1, Math.round((toDay - fromDay) / MS_PER_DAY) + 1);
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private isOneMonth(from: Date, to: Date): boolean {
    const f = this.startOfDay(from);
    const t = this.startOfDay(to);

    // 1) Calendar month: from = day 1 → to = last day of same month.
    if (
      f.getDate() === 1 &&
      f.getFullYear() === t.getFullYear() &&
      f.getMonth() === t.getMonth() &&
      t.getDate() === this.lastDayOfMonth(t)
    ) {
      return true;
    }

    // 2) Span >= 1 month difference.
    const monthsDiff = (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
    if (monthsDiff >= 1) {
      return true;
    }

    // 3) 27..31 days span (~ 1 month).
    const days = this.diffDaysInclusive(f, t);
    return days >= 28 && days <= 31;
  }

  private lastDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}
