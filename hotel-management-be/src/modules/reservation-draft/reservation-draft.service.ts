import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ClientRepository } from '@modules/client/client.repository';
import { ReservationRepository } from '@modules/reservation/reservation.repository';
import { CreateReservationDraftDto, ReservationDraftResponseDto } from './dto';

const DRAFT_RESERVE_STATUS = 1;

@Injectable()
export class ReservationDraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationRepository: ReservationRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async create(
    dto: CreateReservationDraftDto,
    currentStaffId: number,
  ): Promise<ReservationDraftResponseDto> {
    const periodFrom = new Date(dto.periodFrom);
    const periodTo = new Date(dto.periodTo);
    if (Number.isNaN(periodFrom.getTime()) || Number.isNaN(periodTo.getTime())) {
      throw new BadRequestException('Invalid period date');
    }
    if (periodTo <= periodFrom) {
      throw new BadRequestException('Period to must be after period from');
    }

    const client = await this.clientRepository.findById(dto.clientId);
    if (!client) throw new NotFoundException('Client not found');

    const room = await this.prisma.room.findFirst({
      where: { roomId: dto.roomId, deletedAt: null },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.facilityId !== dto.facilityId) {
      throw new BadRequestException('Room does not belong to specified facility');
    }

    const hasOverlap = await this.reservationRepository.checkOverlap(
      dto.roomId,
      periodFrom,
      periodTo,
    );
    if (hasOverlap) {
      throw new ConflictException('Khoảng thời gian giữ chỗ trùng với reservation đã có');
    }

    const eternity = dto.eternityDraft ?? false;

    const reserve = await this.prisma.reserve.create({
      data: {
        reserveStatus: DRAFT_RESERVE_STATUS,
        reserveType: 1,
        draftFlag: true,
        eternityDraft: eternity,
        expiredDate: eternity ? null : (dto.expiredDate ?? null),
        confirmFlag: false,
        periodFrom,
        periodTo,
        noreserveCountBefore: 0,
        noreserveCountAfter: 0,
        note: dto.note,
        client: { connect: { clientId: dto.clientId } },
        facility: { connect: { facilityId: dto.facilityId } },
        room: { connect: { roomId: dto.roomId } },
        createdBy: { connect: { staffId: currentStaffId } },
        updatedBy: { connect: { staffId: currentStaffId } },
      },
    });

    return ReservationDraftResponseDto.fromEntity(reserve);
  }
}
