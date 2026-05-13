import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { ERROR_MESSAGES, IPaginated } from '@common/index';
import { SmartLockPinRepository } from './smart-lock-pin.repository';
import {
  CreateSmartLockPinDto,
  RevokeSmartLockPinDto,
  SmartLockPinFilterDto,
  SmartLockPinResponseDto,
  UpdateSmartLockPinDto,
} from './dto/index';

const BCRYPT_ROUNDS = 12;

const SMART_LOCK_PIN_STATUS_ACTIVE = 1;
const SMART_LOCK_PIN_STATUS_REVOKED = 2;
const SMART_LOCK_PIN_STATUS_EXPIRED = 3;

@Injectable()
export class SmartLockPinService {
  constructor(private readonly smartLockPinRepository: SmartLockPinRepository) {}

  async findAll(filter: SmartLockPinFilterDto): Promise<IPaginated<SmartLockPinResponseDto>> {
    const { data, total } = await this.smartLockPinRepository.findAll(filter);

    return {
      items: data.map((item) => SmartLockPinResponseDto.fromEntity(item)),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: number): Promise<SmartLockPinResponseDto> {
    const credential = await this.smartLockPinRepository.findById(id);
    if (!credential) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    return SmartLockPinResponseDto.fromEntity(credential);
  }

  async create(dto: CreateSmartLockPinDto, staffId: number): Promise<SmartLockPinResponseDto> {
    const validFrom = new Date(dto.validFrom);
    const validTo = new Date(dto.validTo);
    this.ensureValidWindow(validFrom, validTo);

    await this.ensureRoomExists(dto.roomId);

    if (dto.reserveId !== undefined) {
      await this.ensureReserveMatchesRoom(dto.reserveId, dto.roomId);
    }

    const status = dto.status ?? SMART_LOCK_PIN_STATUS_ACTIVE;
    if (status === SMART_LOCK_PIN_STATUS_ACTIVE) {
      await this.ensureNoActiveOverlap(dto.roomId, validFrom, validTo);
    }

    const encryptedPin = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);
    const maskedPin = this.maskPin(dto.pin);

    const providerPayload = {
      ...(dto.providerPayload ?? {}),
      automationReleasePin: dto.pin,
    };

    const credential = await this.smartLockPinRepository.create({
      room: { connect: { roomId: dto.roomId } },
      ...(dto.reserveId !== undefined && {
        reserve: { connect: { reserveId: dto.reserveId } },
      }),
      dataStatus: dto.dataStatus ?? 1,
      encryptedPin,
      maskedPin,
      validFrom,
      validTo,
      status,
      issuedAt:
        dto.issuedAt !== undefined
          ? new Date(dto.issuedAt)
          : status === SMART_LOCK_PIN_STATUS_ACTIVE
            ? new Date()
            : null,
      ...(dto.providerCredentialId !== undefined && {
        providerCredentialId: dto.providerCredentialId,
      }),
      providerPayload: providerPayload as Prisma.InputJsonValue,
      createdBy: { connect: { staffId } },
      updatedBy: { connect: { staffId } },
    });

    return SmartLockPinResponseDto.fromEntity(credential);
  }

  async update(
    id: number,
    dto: UpdateSmartLockPinDto,
    staffId: number,
  ): Promise<SmartLockPinResponseDto> {
    const existing = await this.smartLockPinRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const nextRoomId = dto.roomId ?? existing.roomId;
    const nextReserveId = dto.reserveId ?? existing.reserveId ?? undefined;
    const nextValidFrom = dto.validFrom ? new Date(dto.validFrom) : existing.validFrom;
    const nextValidTo = dto.validTo ? new Date(dto.validTo) : existing.validTo;

    this.ensureValidWindow(nextValidFrom, nextValidTo);

    if (dto.roomId !== undefined) {
      await this.ensureRoomExists(dto.roomId);
    }

    if (nextReserveId !== undefined) {
      await this.ensureReserveMatchesRoom(nextReserveId, nextRoomId);
    }

    const nextStatus = dto.status ?? existing.status;
    if (nextStatus === SMART_LOCK_PIN_STATUS_ACTIVE) {
      await this.ensureNoActiveOverlap(nextRoomId, nextValidFrom, nextValidTo, id);
    }

    const updateData: Prisma.RoomPinCredentialUpdateInput = {
      ...(dto.roomId !== undefined && {
        room: { connect: { roomId: dto.roomId } },
      }),
      ...(dto.reserveId !== undefined && {
        reserve: { connect: { reserveId: dto.reserveId } },
      }),
      ...(dto.validFrom !== undefined && {
        validFrom: nextValidFrom,
      }),
      ...(dto.validTo !== undefined && {
        validTo: nextValidTo,
      }),
      ...(dto.status !== undefined && {
        status: dto.status,
      }),
      ...(dto.dataStatus !== undefined && {
        dataStatus: dto.dataStatus,
      }),
      ...(dto.providerCredentialId !== undefined && {
        providerCredentialId: dto.providerCredentialId,
      }),
      ...(dto.providerPayload !== undefined && {
        providerPayload: dto.providerPayload as Prisma.InputJsonValue,
      }),
      ...(dto.syncError !== undefined && {
        syncError: dto.syncError,
      }),
      ...(dto.lastSyncAt !== undefined && {
        lastSyncAt: new Date(dto.lastSyncAt),
      }),
      ...(dto.issuedAt !== undefined && {
        issuedAt: new Date(dto.issuedAt),
      }),
      ...(dto.revokedAt !== undefined && {
        revokedAt: new Date(dto.revokedAt),
      }),
      ...(dto.expiredAt !== undefined && {
        expiredAt: new Date(dto.expiredAt),
      }),
      updatedBy: { connect: { staffId } },
    };

    if (dto.pin !== undefined) {
      updateData.encryptedPin = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);
      updateData.maskedPin = this.maskPin(dto.pin);
      updateData.providerPayload = {
        ...this.readProviderPayloadObject(existing.providerPayload),
        automationReleasePin: dto.pin,
      };
    }

    if (dto.status === SMART_LOCK_PIN_STATUS_REVOKED && dto.revokedAt === undefined) {
      updateData.revokedAt = new Date();
    }

    if (dto.status === SMART_LOCK_PIN_STATUS_EXPIRED && dto.expiredAt === undefined) {
      updateData.expiredAt = new Date();
    }

    if (
      dto.status === SMART_LOCK_PIN_STATUS_ACTIVE &&
      existing.status !== SMART_LOCK_PIN_STATUS_ACTIVE &&
      dto.issuedAt === undefined
    ) {
      updateData.issuedAt = new Date();
    }

    const credential = await this.smartLockPinRepository.update(id, updateData);
    return SmartLockPinResponseDto.fromEntity(credential);
  }

  async revoke(
    id: number,
    dto: RevokeSmartLockPinDto,
    staffId: number,
  ): Promise<SmartLockPinResponseDto> {
    const existing = await this.smartLockPinRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (existing.status === SMART_LOCK_PIN_STATUS_REVOKED) {
      return SmartLockPinResponseDto.fromEntity(existing);
    }

    const credential = await this.smartLockPinRepository.update(id, {
      status: SMART_LOCK_PIN_STATUS_REVOKED,
      revokedAt: dto.revokedAt ? new Date(dto.revokedAt) : new Date(),
      ...(dto.reason !== undefined && { syncError: dto.reason }),
      updatedBy: { connect: { staffId } },
    });

    return SmartLockPinResponseDto.fromEntity(credential);
  }

  async expireOverduePins(staffId: number): Promise<{ updatedCount: number }> {
    const result = await this.smartLockPinRepository.expireActivePins(new Date(), staffId);
    return { updatedCount: result.count };
  }

  async remove(id: number, staffId: number): Promise<void> {
    const existing = await this.smartLockPinRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.smartLockPinRepository.softDelete(id, staffId);
  }

  private ensureValidWindow(validFrom: Date, validTo: Date): void {
    if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validTo.getTime())) {
      throw new BadRequestException('validFrom and validTo must be valid ISO datetime strings');
    }

    if (validTo <= validFrom) {
      throw new BadRequestException('validTo must be after validFrom');
    }
  }

  private async ensureRoomExists(roomId: number): Promise<void> {
    const room = await this.smartLockPinRepository.findRoomById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
  }

  private async ensureReserveMatchesRoom(reserveId: number, roomId: number): Promise<void> {
    const reserve = await this.smartLockPinRepository.findReserveById(reserveId);
    if (!reserve) {
      throw new NotFoundException('Reserve not found');
    }

    if (reserve.roomId !== roomId) {
      throw new BadRequestException('Reserve does not belong to the selected room');
    }
  }

  private async ensureNoActiveOverlap(
    roomId: number,
    validFrom: Date,
    validTo: Date,
    excludeId?: number,
  ): Promise<void> {
    const overlap = await this.smartLockPinRepository.findOverlappingActiveCredential(
      roomId,
      validFrom,
      validTo,
      excludeId,
    );

    if (overlap) {
      throw new ConflictException(
        'Active PIN credential overlaps with an existing credential window',
      );
    }
  }

  private maskPin(pin: string): string {
    const visible = pin.slice(-4);
    return `****${visible}`;
  }

  private readProviderPayloadObject(value: Prisma.JsonValue): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }
}
