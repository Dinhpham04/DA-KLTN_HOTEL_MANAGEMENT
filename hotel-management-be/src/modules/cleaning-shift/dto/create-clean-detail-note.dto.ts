import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCleanDetailNoteDto {
  @ApiProperty({ description: 'Note content', maxLength: 2048 })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  readonly noteContent!: string;
}
