import { IsEnum, IsNumber, IsString } from 'class-validator';
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
}
