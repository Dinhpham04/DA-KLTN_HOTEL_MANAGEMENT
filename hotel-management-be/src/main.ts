import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/index';
import { TransformInterceptor } from '@common/interceptors/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ─── Logger ──────────────────────────────────────
  app.useLogger(app.get(Logger));

  // ─── Security ────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ─── API Prefix & Versioning ─────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ─── Global Pipes / Filters / Interceptors ───────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger ─────────────────────────────────────
  const configService = app.get(ConfigService);
  const appEnv = configService.get<string>('app.env');

  if (appEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Hotel Management API')
      .setDescription('AIC Yokohama Weekly Mansion - Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ─── Start ───────────────────────────────────────
  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 Application running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
