import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import type { BulkUpdateRentDto } from './dto';

@Injectable()
export class RentRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findRentList(depositFlag: number) {
    const rents = await this.prisma.rent.findMany({
      where: {
        deletedAt: null,
        depositFlag,
        roomType: { deletedAt: null },
      },
      include: {
        stayType: { select: { stayTypeName: true } },
        roomType: {
          select: {
            roomTypeId: true,
            roomClassId: true,
            roomTypeNameShort: true,
            orderNum: true,
            orderNumDeposit: true,
          },
        },
      },
      orderBy: { stayTypeId: 'asc' },
    });

    const stayTypes = await this.prisma.stayType.findMany({
      where: { deletedAt: null },
      orderBy: { stayTypeId: 'asc' },
    });

    // Group rents by room_type_id
    const grouped = new Map<number, {
      roomTypeId: number;
      roomClassId: number | null;
      roomTypeNameShort: string | null;
      monthMainteFee: bigint | number | null;
      monthUtilityFee: bigint | number | null;
      orderNum: number;
      rents: typeof rents;
    }>();

    for (const rent of rents) {
      if (!grouped.has(rent.roomTypeId)) {
        grouped.set(rent.roomTypeId, {
          roomTypeId: rent.roomTypeId,
          roomClassId: rent.roomType?.roomClassId ?? null,
          roomTypeNameShort: rent.roomType?.roomTypeNameShort ?? null,
          monthMainteFee: rent.monthMainteFee,
          monthUtilityFee: rent.monthUtilityFee,
          orderNum: depositFlag === 1
            ? (rent.roomType?.orderNumDeposit ?? rent.roomType?.orderNum ?? 1)
            : (rent.roomType?.orderNum ?? 1),
          rents: [],
        });
      }
      grouped.get(rent.roomTypeId)!.rents.push(rent);
    }

    // For each room type, fill missing stay types with null data
    const result = Array.from(grouped.values()).map((group) => ({
      ...group,
      rents: stayTypes.map((st) => {
        const found = group.rents.find((r) => r.stayTypeId === st.stayTypeId);
        return {
          stayTypeId: st.stayTypeId,
          dataStatus: found?.dataStatus ?? null,
          dayRent: found?.dayRent ?? null,
          monthRent: found?.monthRent ?? null,
          dayRentOver3: found?.dayRentOver3 ?? null,
          monthRentOver3: found?.monthRentOver3 ?? null,
          dayCleanFee: found?.dayCleanFee ?? null,
          monthCleanFee: found?.monthCleanFee ?? null,
          dayCleanFeeOver3: found?.dayCleanFeeOver3 ?? null,
          monthCleanFeeOver3: found?.monthCleanFeeOver3 ?? null,
          dayMainteFee: found?.dayMainteFee ?? null,
          dayUtilityFee: found?.dayUtilityFee ?? null,
          depositPay: found?.depositPay ?? null,
          depositPayOver3: found?.depositPayOver3 ?? null,
          monthMainteFee: found?.monthMainteFee ?? null,
          monthUtilityFee: found?.monthUtilityFee ?? null,
          stayType: { stayTypeName: st.stayTypeName },
        };
      }),
    }));

    // Sort by room_type_name_short (S < T < F < E < O)
    const prefixOrder: Record<string, number> = { S: 0, T: 1, F: 2, E: 3, O: 4 };
    result.sort((a, b) => {
      const prefA = a.roomTypeNameShort?.charAt(0) ?? '';
      const prefB = b.roomTypeNameShort?.charAt(0) ?? '';
      const orderA = prefixOrder[prefA] ?? 99;
      const orderB = prefixOrder[prefB] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      const suffA = a.roomTypeNameShort?.slice(1) ?? '';
      const suffB = b.roomTypeNameShort?.slice(1) ?? '';
      return suffA.localeCompare(suffB);
    });

    return result;
  }

  async bulkUpdateNotDeposited(dto: BulkUpdateRentDto, staffId: number) {
    return this.prisma.$transaction(async (tx) => {
      const roomTypeIds = dto.data.map((g) => g.roomTypeId);

      // Update order_num for room types
      for (let i = 0; i < roomTypeIds.length; i++) {
        await tx.roomType.updateMany({
          where: { roomTypeId: roomTypeIds[i], deletedAt: null },
          data: { orderNum: i + 1, updatedStaffId: staffId },
        });
      }

      // Delete rents for room types not in the payload
      await tx.rent.updateMany({
        where: {
          depositFlag: 0,
          roomTypeId: { notIn: roomTypeIds },
          deletedAt: null,
        },
        data: { deletedAt: new Date(), deletedStaffId: staffId },
      });

      // Upsert rents
      for (const group of dto.data) {
        for (const item of group.rents) {
          const existing = await tx.rent.findFirst({
            where: {
              roomTypeId: group.roomTypeId,
              stayTypeId: item.stayTypeId,
              deletedAt: null,
            },
          });

          const rentData = {
            depositFlag: 0,
            dataStatus: item.dataStatus,
            dayRent: item.dayRent ?? null,
            monthRent: item.monthRent ?? null,
            dayRentOver3: item.dayRentOver3 ?? null,
            monthRentOver3: item.monthRentOver3 ?? null,
            dayCleanFee: item.dayCleanFee ?? null,
            monthCleanFee: item.monthCleanFee ?? null,
            dayCleanFeeOver3: item.dayCleanFeeOver3 ?? null,
            monthCleanFeeOver3: item.monthCleanFeeOver3 ?? null,
            dayMainteFee: item.dayMainteFee ?? null,
            monthMainteFee: group.monthMainteFee ?? null,
            dayUtilityFee: item.dayUtilityFee ?? null,
            monthUtilityFee: group.monthUtilityFee ?? null,
            depositPay: item.depositPay ?? null,
            depositPayOver3: item.depositPayOver3 ?? null,
            updatedStaffId: staffId,
          };

          if (existing) {
            await tx.rent.update({
              where: { rentId: existing.rentId },
              data: rentData,
            });
          } else {
            await tx.rent.create({
              data: {
                roomTypeId: group.roomTypeId,
                stayTypeId: item.stayTypeId,
                ...rentData,
                createdStaffId: staffId,
              },
            });
          }
        }
      }
    });
  }

  async bulkUpdateDeposited(dto: BulkUpdateRentDto, staffId: number) {
    return this.prisma.$transaction(async (tx) => {
      const roomTypeIds = dto.data.map((g) => g.roomTypeId);

      // Update order_num_deposit for room types
      for (let i = 0; i < roomTypeIds.length; i++) {
        await tx.roomType.updateMany({
          where: { roomTypeId: roomTypeIds[i], deletedAt: null },
          data: { orderNumDeposit: i + 1, updatedStaffId: staffId },
        });
      }

      // Soft-delete rents for room types not in the payload
      await tx.rent.updateMany({
        where: {
          depositFlag: 1,
          roomTypeId: { notIn: roomTypeIds },
          deletedAt: null,
        },
        data: { deletedAt: new Date(), deletedStaffId: staffId },
      });

      // Upsert rents
      for (const group of dto.data) {
        for (const item of group.rents) {
          const existing = await tx.rent.findFirst({
            where: {
              roomTypeId: group.roomTypeId,
              stayTypeId: item.stayTypeId,
              depositFlag: 1,
              deletedAt: null,
            },
          });

          const rentData = {
            depositFlag: 1,
            dataStatus: item.dataStatus,
            dayRent: item.dayRent ?? null,
            monthRent: item.monthRent ?? null,
            dayRentOver3: item.dayRentOver3 ?? null,
            monthRentOver3: item.monthRentOver3 ?? null,
            dayCleanFee: item.dayCleanFee ?? null,
            monthCleanFee: item.monthCleanFee ?? null,
            dayCleanFeeOver3: item.dayCleanFeeOver3 ?? null,
            monthCleanFeeOver3: item.monthCleanFeeOver3 ?? null,
            dayMainteFee: item.dayMainteFee ?? null,
            monthMainteFee: group.monthMainteFee ?? null,
            dayUtilityFee: item.dayUtilityFee ?? null,
            monthUtilityFee: group.monthUtilityFee ?? null,
            depositPay: item.depositPay ?? null,
            depositPayOver3: item.depositPayOver3 ?? null,
            updatedStaffId: staffId,
          };

          if (existing) {
            await tx.rent.update({
              where: { rentId: existing.rentId },
              data: rentData,
            });
          } else {
            await tx.rent.create({
              data: {
                roomTypeId: group.roomTypeId,
                stayTypeId: item.stayTypeId,
                ...rentData,
                createdStaffId: staffId,
              },
            });
          }
        }
      }
    });
  }
}
