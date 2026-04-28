import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateMainStaffDto {
  @ApiProperty({ description: 'New main staff ID (null to unassign)', nullable: true })
  @IsOptional()
  @IsInt()
  readonly mainStaffId!: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly mainStaffExternalFlag?: boolean;
}
