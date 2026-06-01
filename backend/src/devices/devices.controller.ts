import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { DevicesService } from './devices.service';
import { LaunchDeviceDto } from './dto/launch-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @Get()
  getDevices() {
    return this.devicesService.getDevices();
  }

  @Get('online')
  getOnlineDevices() {
    return this.devicesService.getOnlineDevices();
  }

  @Get('db')
  getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Get('launch-logs')
  getLaunchLogs() {
    return this.devicesService.getLaunchLogs();
  }

  @Post('launch')
  launch(
    @Body() dto: LaunchDeviceDto,
  ) {
    return this.devicesService.launchDevice(
      dto.deviceId,
      dto.module,
    );
  }
}