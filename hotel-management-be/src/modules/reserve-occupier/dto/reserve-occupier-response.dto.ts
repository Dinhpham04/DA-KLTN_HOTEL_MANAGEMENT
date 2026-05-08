import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { ReserveOccupier } from '@prisma/client'

export class ReserveOccupierResponseDto {
  @ApiProperty() reserveOccupierId!: number
  @ApiProperty() reserveId!: number
  @ApiPropertyOptional() clientId!: number | null
  @ApiProperty() occupierName!: string
  @ApiProperty() sex!: number
  @ApiPropertyOptional() birthday!: string | null
  @ApiPropertyOptional() tel!: string | null
  @ApiPropertyOptional() address1!: string | null
  @ApiPropertyOptional() orderNum!: number | null
  @ApiProperty() createdAt!: Date
  @ApiProperty() updatedAt!: Date

  static fromEntity(entity: ReserveOccupier): ReserveOccupierResponseDto {
    const dto = new ReserveOccupierResponseDto()
    dto.reserveOccupierId = entity.reserveOccupierId
    dto.reserveId = entity.reserveId
    dto.clientId = entity.clientId
    dto.occupierName = entity.occupierName
    dto.sex = entity.sex
    dto.birthday = entity.birthday ? entity.birthday.toISOString().split('T')[0] : null
    dto.tel = entity.tel
    dto.address1 = entity.address1
    dto.orderNum = entity.orderNum
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}
