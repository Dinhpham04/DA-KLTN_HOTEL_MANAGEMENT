import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_MESSAGES } from '@common/index';
import { IdentificationRepository } from './identification.repository';
import {
  CreateIdentificationDto,
  UpdateIdentificationDto,
  IdentificationResponseDto,
} from './dto';

@Injectable()
export class IdentificationService {
  constructor(private readonly identificationRepository: IdentificationRepository) {}

  async findByClientId(clientId: number): Promise<IdentificationResponseDto[]> {
    const identifications = await this.identificationRepository.findByClientId(clientId);
    return identifications.map(IdentificationResponseDto.fromEntity);
  }

  async findById(id: number): Promise<IdentificationResponseDto> {
    const identification = await this.identificationRepository.findById(id);
    if (!identification) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return IdentificationResponseDto.fromEntity(identification);
  }

  async create(
    clientId: number,
    dto: CreateIdentificationDto,
    currentStaffId: number,
  ): Promise<IdentificationResponseDto> {
    const data: Prisma.IdentificationCreateInput = {
      identificationType: dto.identificationType,
      identificationTypeInput: dto.identificationTypeInput,
      identificationInputType: dto.identificationInputType ?? 1,
      imagePath: dto.imagePath,
      identificationNumber: dto.identificationNumber,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
      active: dto.active ?? true,
      client: { connect: { clientId } },
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const identification = await this.identificationRepository.create(data);
    return IdentificationResponseDto.fromEntity(identification);
  }

  async update(
    id: number,
    dto: UpdateIdentificationDto,
    currentStaffId: number,
  ): Promise<IdentificationResponseDto> {
    const existing = await this.identificationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    const data: Prisma.IdentificationUpdateInput = {
      ...(dto.identificationType !== undefined && { identificationType: dto.identificationType }),
      ...(dto.identificationTypeInput !== undefined && { identificationTypeInput: dto.identificationTypeInput }),
      ...(dto.identificationInputType !== undefined && { identificationInputType: dto.identificationInputType }),
      ...(dto.imagePath !== undefined && { imagePath: dto.imagePath }),
      ...(dto.identificationNumber !== undefined && { identificationNumber: dto.identificationNumber }),
      ...(dto.expirationDate !== undefined && {
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
      }),
      ...(dto.active !== undefined && { active: dto.active }),
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const identification = await this.identificationRepository.update(id, data);
    return IdentificationResponseDto.fromEntity(identification);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.identificationRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.identificationRepository.softDelete(id, currentStaffId);
  }
}
