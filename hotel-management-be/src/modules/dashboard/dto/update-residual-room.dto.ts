import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Min } from 'class-validator';

export class UpsertResidualRoomDto {
  @ApiProperty({ description: 'Target date (YYYY/MM/DD)', example: '2026/04/30' })
  @IsString()
  @Matches(/^\d{4}[/-]\d{2}[/-]\d{2}$/, {
    message: 'date must be in YYYY/MM/DD or YYYY-MM-DD format',
  })
  readonly date!: string;

  @ApiProperty({ description: 'Target empty rooms count', example: 5 })
  @IsInt()
  @Min(0)
  readonly number!: number;
}
