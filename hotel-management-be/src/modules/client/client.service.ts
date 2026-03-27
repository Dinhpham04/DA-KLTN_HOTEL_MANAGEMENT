import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IPaginated, ERROR_MESSAGES } from '@common/index';
import { ClientRepository } from './client.repository';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientFilterDto,
  ClientResponseDto,
} from './dto';

@Injectable()
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) { }

  async findAll(filter: ClientFilterDto): Promise<IPaginated<ClientResponseDto>> {
    const { data, total } = await this.clientRepository.findAll(filter);

    return {
      items: data.map(ClientResponseDto.fromEntity),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);
    if (!client) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    return ClientResponseDto.fromEntity(client);
  }

  async create(dto: CreateClientDto, currentStaffId: number): Promise<ClientResponseDto> {
    if (dto.email) {
      await this.ensureEmailUnique(dto.email);
    }

    const data: Prisma.ClientCreateInput = {
      dataType: dto.dataType,
      clientName: dto.clientName,
      clientNameEn: dto.clientNameEn,
      birthday: dto.birthday ? new Date(dto.birthday) : null,
      sex: dto.sex ?? 9,
      contactName: dto.contactName,
      contactNameEn: dto.contactNameEn,
      companyName: dto.companyName,
      companyNameEn: dto.companyNameEn,
      email: dto.email,
      zipCode: dto.zipCode,
      companyZipCode: dto.companyZipCode,
      address1: dto.address1,
      address2: dto.address2,
      companyAddress1: dto.companyAddress1,
      companyAddress2: dto.companyAddress2,
      tel: dto.tel,
      telPhone: dto.telPhone,
      telEmergency: dto.telEmergency,
      companyTel: dto.companyTel,
      emergencyRelation: dto.emergencyRelation,
      fax: dto.fax,
      postpaidFlag: dto.postpaidFlag ?? false,
      stayDurationAutoFlag: dto.stayDurationAutoFlag ?? false,
      ugFlag: dto.ugFlag ?? false,
      usedMessyLevel: dto.usedMessyLevel,
      advertisingType: dto.advertisingType,
      memo: dto.memo,
      ...(dto.countryId !== undefined && {
        country: { connect: { countryId: dto.countryId } },
      }),
      createdBy: { connect: { staffId: currentStaffId } },
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const client = await this.clientRepository.create(data);
    return ClientResponseDto.fromEntity(client);
  }

  async update(id: number, dto: UpdateClientDto, currentStaffId: number): Promise<ClientResponseDto> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

    if (dto.email !== undefined && dto.email !== existing.email) {
      await this.ensureEmailUnique(dto.email, id);
    }

    const data: Prisma.ClientUpdateInput = {
      ...(dto.dataStatus !== undefined && { dataStatus: dto.dataStatus }),
      ...(dto.dataType !== undefined && { dataType: dto.dataType }),
      ...(dto.clientName !== undefined && { clientName: dto.clientName }),
      ...(dto.clientNameEn !== undefined && { clientNameEn: dto.clientNameEn }),
      ...(dto.birthday !== undefined && { birthday: dto.birthday ? new Date(dto.birthday) : null }),
      ...(dto.sex !== undefined && { sex: dto.sex }),
      ...(dto.contactName !== undefined && { contactName: dto.contactName }),
      ...(dto.contactNameEn !== undefined && { contactNameEn: dto.contactNameEn }),
      ...(dto.companyName !== undefined && { companyName: dto.companyName }),
      ...(dto.companyNameEn !== undefined && { companyNameEn: dto.companyNameEn }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
      ...(dto.companyZipCode !== undefined && { companyZipCode: dto.companyZipCode }),
      ...(dto.countryId !== undefined && {
        country: { connect: { countryId: dto.countryId } },
      }),
      ...(dto.address1 !== undefined && { address1: dto.address1 }),
      ...(dto.address2 !== undefined && { address2: dto.address2 }),
      ...(dto.companyAddress1 !== undefined && { companyAddress1: dto.companyAddress1 }),
      ...(dto.companyAddress2 !== undefined && { companyAddress2: dto.companyAddress2 }),
      ...(dto.tel !== undefined && { tel: dto.tel }),
      ...(dto.telPhone !== undefined && { telPhone: dto.telPhone }),
      ...(dto.telEmergency !== undefined && { telEmergency: dto.telEmergency }),
      ...(dto.companyTel !== undefined && { companyTel: dto.companyTel }),
      ...(dto.emergencyRelation !== undefined && { emergencyRelation: dto.emergencyRelation }),
      ...(dto.fax !== undefined && { fax: dto.fax }),
      ...(dto.postpaidFlag !== undefined && { postpaidFlag: dto.postpaidFlag }),
      ...(dto.stayDurationAutoFlag !== undefined && { stayDurationAutoFlag: dto.stayDurationAutoFlag }),
      ...(dto.ugFlag !== undefined && { ugFlag: dto.ugFlag }),
      ...(dto.usedMessyLevel !== undefined && { usedMessyLevel: dto.usedMessyLevel }),
      ...(dto.advertisingType !== undefined && { advertisingType: dto.advertisingType }),
      ...(dto.memo !== undefined && { memo: dto.memo }),
      updatedBy: { connect: { staffId: currentStaffId } },
    };

    const client = await this.clientRepository.update(id, data);
    return ClientResponseDto.fromEntity(client);
  }

  async remove(id: number, currentStaffId: number): Promise<void> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    await this.clientRepository.softDelete(id, currentStaffId);
  }

  private async ensureEmailUnique(email: string, excludeId?: number): Promise<void> {
    const duplicate = await this.clientRepository.findByEmail(email, excludeId);
    if (duplicate) {
      throw new ConflictException(`Client with email "${email}" already exists`);
    }
  }
}
