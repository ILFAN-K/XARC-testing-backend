import { Module } from '@nestjs/common';

import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

import { GatewayModule } from '../gateway/gateway.module';
import { DevicePersistenceModule } from '../device-persistence/device-persistence.module';

@Module({
  imports: [
    GatewayModule,
    DevicePersistenceModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}