import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import {
  validate,
  appConfig,
  databaseConfig,
  jwtConfig,
  throttleConfig,
  cloudinaryConfig,
} from '@config/index';
import { DatabaseModule } from '@database/index';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { StaffModule } from '@modules/staff/staff.module';
import { FacilityModule } from '@modules/facility/facility.module';
import { RoomClassModule } from '@modules/room-class/room-class.module';
import { RoomTypeModule } from '@modules/room-type/room-type.module';
import { RoomModule } from '@modules/room/room.module';
import { ClientModule } from '@modules/client/client.module';
import { IdentificationModule } from '@modules/identification/identification.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { CountryModule } from '@modules/country/country.module';
import { UploadModule } from '@modules/upload/upload.module';
import { FacilityRoomTypeModule } from '@modules/facility-room-type/facility-room-type.module';
import { StayTypeModule } from '@modules/stay-type/stay-type.module';
import { ParkingModule } from '@modules/parking/parking.module';
import { BicycleParkingModule } from '@modules/bicycle-parking/bicycle-parking.module';
import { RentModule } from '@modules/rent/rent.module';
import { SmartLockPinModule } from '@modules/smart-lock-pin/smart-lock-pin.module';
import { ParkingStatusModule } from '@modules/parking-status/parking-status.module';
import { ParkingReserveModule } from '@modules/parking-reserve/parking-reserve.module';
import { WhiteboardModule } from '@modules/whiteboard/whiteboard.module';
import { CleaningShiftModule } from '@modules/cleaning-shift/cleaning-shift.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ─── Config ────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [appConfig, databaseConfig, jwtConfig, throttleConfig, cloudinaryConfig],
    }),

    // ─── Logging (pino) ────────────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env['APP_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        autoLogging: true,
        serializers: {
          req: (req: Record<string, unknown>) => ({
            method: req['method'],
            url: req['url'],
          }),
          res: (res: Record<string, unknown>) => ({
            statusCode: res['statusCode'],
          }),
        },
      },
    }),

    // ─── Rate Limiting ─────────────────────────────
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env['THROTTLE_TTL'] || '60000', 10),
          limit: parseInt(process.env['THROTTLE_LIMIT'] || '60', 10),
        },
      ],
    }),

    // ─── Event System ──────────────────────────────
    EventEmitterModule.forRoot(),

    // ─── Scheduling ────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Database ──────────────────────────────────
    DatabaseModule,

    // ─── Feature Modules ───────────────────────────
    AuthModule,
    HealthModule,
    StaffModule,
    FacilityModule,
    RoomClassModule,
    RoomTypeModule,
    RoomModule,
    ClientModule,
    IdentificationModule,
    ReservationModule,
    CountryModule,
    UploadModule,
    FacilityRoomTypeModule,
    StayTypeModule,
    ParkingModule,
    BicycleParkingModule,
    RentModule,
    SmartLockPinModule,
    ParkingStatusModule,
    ParkingReserveModule,
    WhiteboardModule,
    CleaningShiftModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
