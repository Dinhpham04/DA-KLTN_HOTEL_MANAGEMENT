import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { UploadResponseDto } from './dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly folder: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    this.logger.log(
      `Cloudinary config: cloud_name=${cloudName}, api_key=${apiKey}, api_secret=${apiSecret}`,
    );

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.folder =
      this.configService.get<string>('cloudinary.folder') || 'hotel-management';
  }

  async uploadImage(
    file: Express.Multer.File,
    subfolder?: string,
  ): Promise<UploadResponseDto> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    try {
      const uploadFolder = subfolder
        ? `${this.folder}/${subfolder}`
        : this.folder;
      const result = await this.uploadToCloudinary(file.buffer, {
        folder: uploadFolder,
        resource_type: 'image',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      });

      this.logger.log(`Image uploaded successfully: ${result.public_id}`);
      return UploadResponseDto.fromCloudinaryResult(result, file);
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary', error);
      throw new BadRequestException(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${publicId}`, error);
      throw new BadRequestException('Failed to delete image.');
    }
  }

  private uploadToCloudinary(
    buffer: Buffer,
    options: Record<string, unknown>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result);
          reject(new Error('Upload failed without error'));
        },
      );

      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });
  }
}
