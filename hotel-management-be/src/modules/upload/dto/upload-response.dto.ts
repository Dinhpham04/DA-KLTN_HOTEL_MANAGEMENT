import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'Uploaded file URL' })
  url!: string;

  @ApiProperty({ description: 'Cloudinary public ID' })
  publicId!: string;

  @ApiProperty({ description: 'Original filename' })
  originalName!: string;

  @ApiProperty({ description: 'File size in bytes' })
  size!: number;

  @ApiProperty({ description: 'MIME type' })
  mimeType!: string;

  static fromCloudinaryResult(
    result: { secure_url: string; public_id: string },
    file: { originalname: string; size: number; mimetype: string },
  ): UploadResponseDto {
    const dto = new UploadResponseDto();
    dto.url = result.secure_url;
    dto.publicId = result.public_id;
    dto.originalName = file.originalname;
    dto.size = file.size;
    dto.mimeType = file.mimetype;
    return dto;
  }
}
