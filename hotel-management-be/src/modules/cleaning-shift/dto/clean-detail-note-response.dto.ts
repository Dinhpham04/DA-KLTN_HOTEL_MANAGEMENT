import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CleanDetailNoteResponseDto {
  @ApiProperty()
  cleanDetailNoteId!: number;

  @ApiProperty()
  cleaningDetailId!: number;

  @ApiProperty()
  noteContent!: string;

  @ApiProperty()
  createdStaffId!: number;

  @ApiPropertyOptional({ nullable: true })
  createdStaffName!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
