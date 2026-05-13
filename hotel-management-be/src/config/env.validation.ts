import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsString()
  APP_NAME!: string;

  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  APP_PORT!: number;

  @IsEnum(Environment)
  APP_ENV!: Environment;

  @IsString()
  APP_TIMEZONE!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  THROTTLE_TTL!: number;

  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  THROTTLE_LIMIT!: number;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_FOLDER?: string;

  @IsString()
  @IsOptional()
  INTERNAL_AUTOMATION_TOKEN?: string;

  @IsString()
  @IsOptional()
  N8N_RESERVATION_CREATED_WEBHOOK_URL?: string;

  @IsString()
  @IsOptional()
  N8N_RESERVATION_CHECKED_IN_WEBHOOK_URL?: string;

  @IsString()
  @IsOptional()
  N8N_AUTOMATION_SECRET?: string;

  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  @IsOptional()
  RESERVATION_AUTOMATION_STAFF_ID?: number;

  @Transform(({ value }) => parseInt(value as string, 10))
  @IsNumber()
  @IsOptional()
  CLEANING_AUTOMATION_STAFF_ID?: number;
}
