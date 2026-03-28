import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env['APP_NAME'] || 'hotel-management-be',
  port: parseInt(process.env['PORT'] || process.env['APP_PORT'] || '3000', 10),
  env: process.env['APP_ENV'] || 'development',
  timezone: process.env['APP_TIMEZONE'] || 'Asia/Tokyo',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env['DATABASE_URL'],
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env['JWT_SECRET'],
  expiresIn: process.env['JWT_EXPIRES_IN'] || '1d',
  refreshSecret: process.env['JWT_REFRESH_SECRET'],
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env['THROTTLE_TTL'] || '60000', 10),
  limit: parseInt(process.env['THROTTLE_LIMIT'] || '60', 10),
}));

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudName: process.env['CLOUDINARY_CLOUD_NAME'],
  apiKey: process.env['CLOUDINARY_API_KEY'],
  apiSecret: process.env['CLOUDINARY_API_SECRET'],
  folder: process.env['CLOUDINARY_FOLDER'] || 'hotel-management',
}));
