import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';
import { APP_CONSTANTS, ERROR_MESSAGES } from '@common/constants/index';
import type { IPaginated } from '@common/interfaces/repository.interface';
import { StaffRepository } from './staff.repository';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { StaffResponseDto } from './dto/staff-response.dto';

@Injectable()
export class StaffService {
  constructor(private readonly staffRepository: StaffRepository) { }

  async findAll(filter: StaffFilterDto): Promise<IPaginated<StaffResponseDto>> {
    const result = await this.staffRepository.findAll(filter);
    return {
      items: result.items.map((s) => StaffResponseDto.fromEntity(s)),
      meta: result.meta,
    };
  }

  async findById(id: number): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    return StaffResponseDto.fromEntity(staff);
  }

  async create(dto: CreateStaffDto, currentStaffId: number): Promise<StaffResponseDto> {
    const existing = await this.staffRepository.findByMail(dto.mail);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_ROUNDS);

    const staff = await this.staffRepository.create({
      staffType: dto.staffType,
      staffName: dto.staffName,
      staffNameEn: dto.staffNameEn,
      staffNameShort: dto.staffNameShort,
      sex: dto.sex ?? 9,
      zipCode: dto.zipCode,
      address: dto.address,
      mail: dto.mail,
      loginPassword: hashedPassword,
      tel: dto.tel,
      businessTel: dto.businessTel,
      emergencyTel: dto.emergencyTel,
      orderNum: dto.orderNum,
      displayInAttendance: dto.displayInAttendance ?? true,
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    });

    return StaffResponseDto.fromEntity(staff);
  }

  async update(id: number, dto: UpdateStaffDto, currentStaffId: number): Promise<StaffResponseDto> {
    const existing = await this.staffRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (dto.mail !== undefined && dto.mail !== existing.mail) {
      const mailTaken = await this.staffRepository.findByMail(dto.mail);
      if (mailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: Prisma.StaffUpdateInput = {
      updatedBy: { connect: { staffId: currentStaffId } },
      ...(dto.staffType !== undefined && { staffType: dto.staffType }),
      ...(dto.staffName !== undefined && { staffName: dto.staffName }),
      ...(dto.staffNameEn !== undefined && { staffNameEn: dto.staffNameEn }),
      ...(dto.staffNameShort !== undefined && { staffNameShort: dto.staffNameShort }),
      ...(dto.sex !== undefined && { sex: dto.sex }),
      ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.mail !== undefined && { mail: dto.mail }),
      ...(dto.tel !== undefined && { tel: dto.tel }),
      ...(dto.businessTel !== undefined && { businessTel: dto.businessTel }),
      ...(dto.emergencyTel !== undefined && { emergencyTel: dto.emergencyTel }),
      ...(dto.orderNum !== undefined && { orderNum: dto.orderNum }),
      ...(dto.displayInAttendance !== undefined && {
        displayInAttendance: dto.displayInAttendance,
      }),
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
    };

    if (dto.password) {
      updateData.loginPassword = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_ROUNDS);
    }

    const staff = await this.staffRepository.update(id, updateData);
    return StaffResponseDto.fromEntity(staff);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.staffRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    await this.staffRepository.softDelete(id, currentStaffId);
  }
}
