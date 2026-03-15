import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { RoomRepository } from './room.repository';
import {
  CreateRoomDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
  RoomFilterDto,
  RoomResponseDto,
} from './dto';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) { }

  async findAll(filter: RoomFilterDto): Promise<IPaginated<RoomResponseDto>> {
    const { data, total } = await this.roomRepository.findAll(filter);

    return {
      items: data.map(RoomResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findById(id);
    if (!room) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return RoomResponseDto.fromEntity(room);
  }

  async create(dto: CreateRoomDto, currentStaffId: number): Promise<RoomResponseDto> {
    await this.ensureRoomNumberUnique(dto.roomNumber, dto.facilityId);

    const data: Prisma.RoomCreateInput = {
      roomNumber: dto.roomNumber,
      roomStatus: dto.roomStatus,
      mailboxPassword: dto.mailboxPassword,
      keyType: dto.keyType,
      reservedCleanDay: dto.reservedCleanDay ?? 0,
      deliveryboxFlag: dto.deliveryboxFlag ?? false,
      petFlag: dto.petFlag ?? false,
      orderNum: dto.orderNum ?? 1,
      externalFlag: dto.externalFlag ?? false,
      externalDateFrom: dto.externalDateFrom ? new Date(dto.externalDateFrom) : null,
      externalDateTo: dto.externalDateTo ? new Date(dto.externalDateTo) : null,
      facility: { connect: { facilityId: dto.facilityId } },
      roomType: { connect: { roomTypeId: dto.roomTypeId } },
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const room = await this.roomRepository.create(data);
    return RoomResponseDto.fromEntity(room);
  }

  async update(id: number, dto: UpdateRoomDto, currentStaffId: number): Promise<RoomResponseDto> {
    const existing = await this.roomRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.roomNumber !== undefined && dto.roomNumber !== existing.roomNumber) {
      await this.ensureRoomNumberUnique(
        dto.roomNumber,
        dto.facilityId ?? existing.facilityId,
        id,
      );
    }

    const data: Prisma.RoomUpdateInput = {
      ...(dto.roomNumber !== undefined && { roomNumber: dto.roomNumber }),
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.roomStatus !== undefined && { roomStatus: dto.roomStatus }),
      ...(dto.keyType !== undefined && { keyType: dto.keyType }),
      ...(dto.reservedCleanDay !== undefined && { reservedCleanDay: dto.reservedCleanDay }),
      ...(dto.deliveryboxFlag !== undefined && { deliveryboxFlag: dto.deliveryboxFlag }),
      ...(dto.petFlag !== undefined && { petFlag: dto.petFlag }),
      ...(dto.mailboxPassword !== undefined && { mailboxPassword: dto.mailboxPassword }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      ...(dto.externalFlag !== undefined && { externalFlag: dto.externalFlag }),
      ...(dto.externalDateFrom !== undefined && {
        externalDateFrom: dto.externalDateFrom ? new Date(dto.externalDateFrom) : null,
      }),
      ...(dto.externalDateTo !== undefined && {
        externalDateTo: dto.externalDateTo ? new Date(dto.externalDateTo) : null,
      }),
      ...(dto.facilityId !== undefined && {
        facility: { connect: { facilityId: dto.facilityId } },
      }),
      ...(dto.roomTypeId !== undefined && {
        roomType: { connect: { roomTypeId: dto.roomTypeId } },
      }),
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const room = await this.roomRepository.update(id, data);
    return RoomResponseDto.fromEntity(room);
  }

  async updateStatus(
    id: number,
    dto: UpdateRoomStatusDto,
    currentStaffId: number,
  ): Promise<RoomResponseDto> {
    const existing = await this.roomRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const room = await this.roomRepository.update(id, {
      roomStatus: dto.roomStatus,
      updatedBy: { connect: { staffId: currentStaffId } },
    });
    return RoomResponseDto.fromEntity(room);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.roomRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.roomRepository.softDelete(id, currentStaffId);
  }

  private async ensureRoomNumberUnique(
    roomNumber: string,
    facilityId: number,
    excludeId?: number,
  ): Promise<void> {
    const duplicate = await this.roomRepository.findByRoomNumber(
      roomNumber,
      facilityId,
      excludeId,
    );
    if (duplicate) {
      throw new ConflictException(
        `Room number "${roomNumber}" already exists in this facility`,
      );
    }
  }
}
