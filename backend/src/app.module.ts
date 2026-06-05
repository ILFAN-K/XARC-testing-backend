import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthController } from './health/health.controller';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { GatewayModule } from './gateway/gateway.module';
import { DevicesModule } from './devices/devices.module';
import { DevicePersistenceModule } from './device-persistence/device-persistence.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    GatewayModule,
    DevicesModule,
    DevicePersistenceModule,
  ],
  controllers: [
    AppController,
    HealthController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}