import { PartialType } from '@nestjs/swagger';
import { CreateCleanDetailNoteDto } from './create-clean-detail-note.dto';

export class UpdateCleanDetailNoteDto extends PartialType(CreateCleanDetailNoteDto) {}
