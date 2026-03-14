import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { RoomClassRepository } from './room-class.repository';
import {
  CreateRoomClassDto,
  UpdateRoomClassDto,
  RoomClassFilterDto,
  RoomClassResponseDto,
} from './dto';

@Injectable()
export class RoomClassService {
  constructor(private readonly roomClassRepository: RoomClassRepository) { }

  async findAll(filter: RoomClassFilterDto): Promise<IPaginated<RoomClassResponseDto>> {
    const { data, total } = await this.roomClassRepository.findAll(filter);

    return {
      data: data.map(RoomClassResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<RoomClassResponseDto> {
    const entity = await this.roomClassRepository.findById(id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return RoomClassResponseDto.fromEntity(entity);
  }

  async create(dto: CreateRoomClassDto, currentStaffId: number): Promise<RoomClassResponseDto> {
    await this.ensureNameUnique(dto.roomClassName);

    const entity = await this.roomClassRepository.create({
      roomClassName: dto.roomClassName,
      orderNum: dto.orderNum ?? 1,
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return RoomClassResponseDto.fromEntity(entity);
  }

  async update(
    id: number,
    dto: UpdateRoomClassDto,
    currentStaffId: number,
  ): Promise<RoomClassResponseDto> {
    const existing = await this.roomClassRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.roomClassName !== undefined && dto.roomClassName !== existing.roomClassName) {
      await this.ensureNameUnique(dto.roomClassName, id);
    }

    const entity = await this.roomClassRepository.update(id, {
      ...(dto.roomClassName !== undefined && { roomClassName: dto.roomClassName }),
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return RoomClassResponseDto.fromEntity(entity);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.roomClassRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.roomClassRepository.softDelete(id, currentStaffId);
  }

  private async ensureNameUnique(name: string, excludeId?: number): Promise<void> {
    const duplicate = await this.roomClassRepository.findByName(name, excludeId);
    if (duplicate) {
      throw new ConflictException(`Room class "${name}" already exists`);
    }
  }
}
