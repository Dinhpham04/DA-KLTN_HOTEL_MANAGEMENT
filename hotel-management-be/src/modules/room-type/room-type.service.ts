import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { RoomTypeRepository } from './room-type.repository';
import {
  CreateRoomTypeDto,
  UpdateRoomTypeDto,
  RoomTypeFilterDto,
  RoomTypeResponseDto,
} from './dto';

@Injectable()
export class RoomTypeService {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) { }

  async findAll(filter: RoomTypeFilterDto): Promise<IPaginated<RoomTypeResponseDto>> {
    const { data, total } = await this.roomTypeRepository.findAll(filter);

    return {
      data: data.map(RoomTypeResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<RoomTypeResponseDto> {
    const entity = await this.roomTypeRepository.findById(id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return RoomTypeResponseDto.fromEntity(entity);
  }

  async create(dto: CreateRoomTypeDto, currentStaffId: number): Promise<RoomTypeResponseDto> {
    await this.ensureNameUnique(dto.roomTypeName, dto.roomClassId);

    const entity = await this.roomTypeRepository.create({
      roomTypeName: dto.roomTypeName,
      roomTypeNameShort: dto.roomTypeNameShort,
      acreage: dto.acreage ?? null,
      orderNum: dto.orderNum ?? 1,
      orderNumDeposit: dto.orderNumDeposit ?? null,
      roomClass: { connect: { roomClassId: dto.roomClassId } },
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return RoomTypeResponseDto.fromEntity(entity);
  }

  async update(
    id: number,
    dto: UpdateRoomTypeDto,
    currentStaffId: number,
  ): Promise<RoomTypeResponseDto> {
    const existing = await this.roomTypeRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.roomTypeName !== undefined && dto.roomTypeName !== existing.roomTypeName) {
      await this.ensureNameUnique(
        dto.roomTypeName,
        dto.roomClassId ?? existing.roomClassId,
        id,
      );
    }

    const entity = await this.roomTypeRepository.update(id, {
      ...(dto.roomTypeName !== undefined && { roomTypeName: dto.roomTypeName }),
      ...(dto.roomTypeNameShort !== undefined && { roomTypeNameShort: dto.roomTypeNameShort }),
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.acreage !== undefined && { acreage: dto.acreage }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      ...(dto.orderNumDeposit !== undefined && { orderNumDeposit: dto.orderNumDeposit }),
      ...(dto.roomClassId !== undefined && {
        roomClass: { connect: { roomClassId: dto.roomClassId } },
      }),
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return RoomTypeResponseDto.fromEntity(entity);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.roomTypeRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.roomTypeRepository.softDelete(id, currentStaffId);
  }

  private async ensureNameUnique(
    name: string,
    roomClassId: number,
    excludeId?: number,
  ): Promise<void> {
    const duplicate = await this.roomTypeRepository.findByName(name, roomClassId, excludeId);
    if (duplicate) {
      throw new ConflictException(
        `Room type "${name}" already exists in this room class`,
      );
    }
  }
}
